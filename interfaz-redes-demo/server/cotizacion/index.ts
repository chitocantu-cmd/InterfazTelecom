// Recepción de cotizaciones: valida, asigna folio, avisa a ventas por correo y WhatsApp,
// manda acuse al cliente y registra el estado de cada canal en los logs de Vercel.
import { QUOTE_TYPES, type QuoteType } from '../../src/data/solutions.js'
import { FILES, SITES, fileExtension, quoteNotice, validateQuote, type QuoteRequest } from '../../src/lib/cotizacion.js'
import { emailReady, getConfig, receptionReady, whatsappReady, type Config } from './config.js'
import { ackEmail, salesEmail, sendEmail } from './correo.js'
import type { Delivery, Quote, QuoteFile } from './tipos.js'
import { sendWhatsApp, templateParams } from './whatsapp.js'

interface Outcome { received: boolean; email: Delivery; whatsapp: Delivery; ack: Delivery }

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } })

const reject = (status: number, codigo: string, mensaje: string, extra: Record<string, unknown> = {}) => json(status, { ok: false, codigo, mensaje, ...extra })

const log = (data: Record<string, unknown>) => console.info(JSON.stringify({ evento: 'cotizacion', ...data }))

/** GET: el cotizador pregunta si la recepción automática está activa; si no, sigue con el envío manual. */
export function handleGet(): Response {
  const cfg = getConfig()
  return json(200, { recepcion: receptionReady(cfg), whatsapp: Boolean(cfg.testDir) || whatsappReady(cfg) })
}

// --- Protección -------------------------------------------------------------------------------

/** Sólo se aceptan envíos desde el propio sitio (sus vistas previas en Vercel y localhost incluidos). */
function allowedOrigin(origin: string | null, cfg: Config) {
  if (!origin) return false
  try {
    const { hostname, protocol } = new URL(origin)
    const site = new URL(cfg.site).hostname
    if (hostname === site || hostname === `www.${site}`) return true
    if (hostname.startsWith('interfaz-redes') && hostname.endsWith('.vercel.app')) return true
    return protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1')
  } catch {
    return false
  }
}

// Memoria de la instancia: límite por IP y solicitudes recientes (evita procesar dos veces un doble clic
// o un reintento del navegador). Con varias instancias, la clave de idempotencia del correo cubre el resto.
const hits = new Map<string, number[]>()
const recent = new Map<string, { at: number; result: Promise<Response> }>()
const WINDOW = 10 * 60_000

function overLimit(ip: string, max: number) {
  const now = Date.now()
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW)
  list.push(now)
  hits.set(ip, list)
  if (hits.size > 5000) hits.clear()
  return list.length > max
}

/** Comprueba que el contenido corresponda a la extensión (no basta con renombrar un archivo). */
function matchesType(ext: string, b: Uint8Array) {
  const ascii = (from: number, n: number) => String.fromCharCode(...b.subarray(from, from + n))
  switch (ext) {
    case 'pdf': return ascii(0, 4) === '%PDF'
    case 'jpg': case 'jpeg': return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
    case 'png': return b[0] === 0x89 && ascii(1, 3) === 'PNG'
    case 'heic': return ascii(4, 4) === 'ftyp'
    case 'docx': case 'xlsx': return b[0] === 0x50 && b[1] === 0x4b
    case 'dwg': return ascii(0, 2) === 'AC'
    case 'dxf': return b.length > 0 && !b.subarray(0, 1024).includes(0)
    default: return false
  }
}

// --- Folio ------------------------------------------------------------------------------------

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

/** COT-AAMMDD-XXXXXX. La parte final sale de la clave del envío: un reintento conserva el mismo folio. */
async function folioFor(key: string, now: Date) {
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key)))
  const code = Array.from(hash.subarray(0, 6), (n) => ALPHABET[n % 32]).join('')
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Monterrey', year: '2-digit', month: '2-digit', day: '2-digit' }).format(now).replace(/-/g, '')
  return `COT-${ymd}-${code}`
}

// --- Entrega ----------------------------------------------------------------------------------

async function deliver(q: Quote, cfg: Config): Promise<Outcome> {
  if (cfg.testDir) return writeTestOutput(q, cfg)
  const sales = salesEmail(q, cfg)
  const [email, whatsapp] = await Promise.all([
    emailReady(cfg)
      ? sendEmail(cfg, { to: cfg.email.to, replyTo: q.request.email.trim(), ...sales, attachments: q.files.map((f) => ({ filename: f.name, content: f.content })), key: `${q.folio}-ventas`, tag: 'cotizacion' })
      : Promise.resolve<Delivery>({ status: 'no_configurado' }),
    whatsappReady(cfg) ? sendWhatsApp(cfg, q) : Promise.resolve<Delivery>({ status: 'no_configurado' }),
  ])
  // Recibida = llegó a ventas por al menos un canal. El acuse sólo se manda si de verdad se recibió.
  const received = email.status === 'enviado' || whatsapp.status === 'enviado' || whatsapp.status === 'parcial'
  const ack: Delivery = received && cfg.email.ack && emailReady(cfg)
    ? await sendEmail(cfg, { to: [q.request.email.trim()], replyTo: cfg.email.replyTo, ...ackEmail(q, cfg), key: `${q.folio}-acuse`, tag: 'acuse', attempts: 2 })
    : { status: 'omitido' }
  return { received, email, whatsapp, ack }
}

/** Modo de prueba local (COTIZACION_PRUEBA=1): escribe lo que se enviaría, sin salir a internet. */
async function writeTestOutput(q: Quote, cfg: Config): Promise<Outcome> {
  const { mkdir, writeFile } = await import('node:fs/promises')
  const dir = cfg.testDir!
  await mkdir(dir, { recursive: true })
  const sales = salesEmail(q, cfg)
  const ack = ackEmail(q, cfg)
  const files = q.files.map((f) => f.name)
  await writeFile(`${dir}/${q.folio}-ventas.html`, sales.html)
  await writeFile(`${dir}/${q.folio}-ventas.txt`, `Para: ${cfg.email.to.join(', ')}\nDe: ${cfg.email.from}\nResponder a: ${q.request.email.trim()}\nAsunto: ${sales.subject}\nAdjuntos: ${files.join(', ') || '—'}\n\n${sales.text}\n`)
  await writeFile(`${dir}/${q.folio}-acuse.html`, ack.html)
  await writeFile(`${dir}/${q.folio}-acuse.txt`, `Para: ${q.request.email.trim()}\nResponder a: ${cfg.email.replyTo}\nAsunto: ${ack.subject}\n\n${ack.text}\n`)
  await writeFile(`${dir}/${q.folio}-whatsapp.txt`, `${quoteNotice(q.request, { files, folio: q.folio, date: q.date })}\n\nParámetros de la plantilla ${cfg.whatsapp.template}:\n${templateParams(q).map((p, i) => `{{${i + 1}}} ${p}`).join('\n')}\n`)
  const test: Delivery = { status: 'prueba' }
  return { received: true, email: test, whatsapp: test, ack: test }
}

// --- POST -------------------------------------------------------------------------------------

export async function handlePost(request: Request): Promise<Response> {
  const cfg = getConfig()
  if (!receptionReady(cfg)) return reject(503, 'no_configurado', 'La recepción automática no está activa. Envíe su solicitud por WhatsApp o correo.')
  if (!allowedOrigin(request.headers.get('origin'), cfg)) return reject(403, 'origen', 'Solicitud no permitida.')

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local'
  if (overLimit(ip, cfg.rateLimit)) {
    log({ resultado: 'limite' })
    return reject(429, 'limite', 'Recibimos varias solicitudes desde su conexión. Espere unos minutos o envíela por WhatsApp.')
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return reject(400, 'formato', 'No pudimos leer la solicitud.')
  }
  const text = (k: string) => {
    const v = form.get(k)
    return typeof v === 'string' ? v : ''
  }

  // Campo trampa (los bots lo llenan; las personas no lo ven) y tiempo mínimo de captura.
  if (text('website') || !(Number(text('elapsed')) >= 3000)) {
    log({ resultado: 'descartada_spam' })
    return reject(400, 'rechazada', 'No pudimos procesar la solicitud. Inténtelo de nuevo.')
  }

  const types = [...new Set(form.getAll('types'))].filter((t): t is QuoteType => typeof t === 'string' && QUOTE_TYPES.some((q) => q.id === t))
  const req: QuoteRequest = {
    types,
    site: SITES.includes(text('site')) ? text('site') : '',
    location: text('location'),
    description: text('description'),
    name: text('name'),
    company: text('company'),
    email: text('email'),
    phone: text('phone'),
    context: text('context').trim() || undefined,
  }
  const errors = validateQuote(req)
  if (Object.keys(errors).length) return reject(400, 'invalida', 'Revise los datos de la solicitud.', { errores: errors })

  const uploads = form.getAll('files').filter((f): f is File => typeof f !== 'string')
  if (uploads.length > FILES.max) return reject(400, 'archivos', `Adjunte como máximo ${FILES.max} archivos.`)
  if (uploads.reduce((s, f) => s + f.size, 0) > FILES.totalBytes) return reject(413, 'archivos', 'Los archivos superan 4 MB en total.')
  const files: QuoteFile[] = []
  for (const f of uploads) {
    const ext = fileExtension(f.name)
    const bytes = new Uint8Array(await f.arrayBuffer())
    if (!FILES.extensions.includes(ext) || !matchesType(ext, bytes)) return reject(400, 'archivos', `El archivo «${f.name.slice(0, 80)}» no es de un tipo permitido.`)
    files.push({ name: f.name.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').slice(-120), size: f.size, content: Buffer.from(bytes).toString('base64') })
  }

  const key = /^[A-Za-z0-9-]{16,64}$/.test(text('key')) ? text('key') : crypto.randomUUID()
  const cached = recent.get(key)
  if (cached && Date.now() - cached.at < 15 * 60_000) return (await cached.result).clone()

  const result = (async () => {
    const now = new Date()
    const quote: Quote = {
      folio: await folioFor(key, now),
      date: new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Monterrey', dateStyle: 'long', timeStyle: 'short' }).format(now),
      request: req,
      files,
    }
    const out = await deliver(quote, cfg)
    log({ folio: quote.folio, recibida: out.received, correo: out.email.status, whatsapp: out.whatsapp.status, acuse: out.ack.status, archivos: files.length, tipos: req.types })
    for (const [canal, d] of Object.entries({ correo: out.email, whatsapp: out.whatsapp, acuse: out.ack })) {
      if (d.status === 'error' || d.status === 'parcial') console.error(JSON.stringify({ evento: 'cotizacion_error', folio: quote.folio, canal, detalle: d.detail }))
    }
    const estados = { correo: out.email.status, whatsapp: out.whatsapp.status, acuse: out.ack.status }
    if (!out.received) {
      recent.delete(key) // permite reintentar
      return reject(502, 'entrega', 'No pudimos entregar su solicitud al equipo comercial. Inténtelo de nuevo o envíela por WhatsApp o correo.', { estados })
    }
    return json(200, { ok: true, folio: quote.folio, fecha: quote.date, estados })
  })()
  recent.set(key, { at: Date.now(), result })
  if (recent.size > 500) recent.delete(recent.keys().next().value!)
  try {
    return (await result).clone()
  } catch (e) {
    recent.delete(key)
    console.error(JSON.stringify({ evento: 'cotizacion_error', canal: 'servidor', detalle: e instanceof Error ? e.message : String(e) }))
    return reject(500, 'servidor', 'Ocurrió un error al procesar la solicitud. Inténtelo de nuevo o envíela por WhatsApp o correo.')
  }
}
