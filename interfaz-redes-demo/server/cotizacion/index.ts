// Recepción de cotizaciones: valida, asigna folio, avisa a ventas por correo y WhatsApp,
// manda acuse al cliente y registra el estado de cada canal en los logs de Vercel.
import { QUOTE_TYPES, type QuoteType } from '../../src/data/quote-types.js'
import { FILES, MAX_LENGTH, SITES, fileExtension, quoteNotice, singleLine, validateQuote, type QuoteRequest } from '../../src/lib/cotizacion.js'
import { emailReady, getConfig, receptionReady, whatsappReady, type Config } from './config.js'
import { ackEmail, salesEmail, sendEmail } from './correo.js'
import type { Delivery, Quote, QuoteFile } from './tipos.js'
import { descriptionTrimmed, sendWhatsApp, templateParams } from './whatsapp.js'

interface Outcome { received: boolean; email: Delivery; whatsapp: Delivery; ack: Delivery }

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } })

const reject = (status: number, codigo: string, mensaje: string, extra: Record<string, unknown> = {}, headers: Record<string, string> = {}) =>
  json(status, { ok: false, codigo, mensaje, ...extra }, headers)

const log = (data: Record<string, unknown>) => console.info(JSON.stringify({ evento: 'cotizacion', ...data }))
const logError = (data: Record<string, unknown>) => console.error(JSON.stringify({ evento: 'cotizacion_error', ...data }))

/**
 * GET: el cotizador pregunta si la recepción automática está activa; si no, sigue con el envío manual.
 * Vercel lo guarda 5 minutos en su caché; cada publicación la limpia (que es cuando cambian las variables).
 */
export function handleGet(): Response {
  const cfg = getConfig()
  return json(200, { recepcion: receptionReady(cfg), whatsapp: Boolean(cfg.testDir) || whatsappReady(cfg) }, { 'Cache-Control': 'public, max-age=0, s-maxage=300' })
}

// --- Protección -------------------------------------------------------------------------------

/**
 * Sólo se aceptan envíos desde el propio sitio. En vistas previas, también desde la dirección de ese despliegue
 * (VERCEL_URL / VERCEL_BRANCH_URL); localhost sólo fuera de Vercel (desarrollo y pruebas).
 */
function allowedOrigin(origin: string | null, cfg: Config) {
  if (!origin) return false
  try {
    const { hostname, protocol } = new URL(origin)
    const site = new URL(cfg.site).hostname
    if (hostname === site || hostname === `www.${site}`) return true
    const own = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL].filter(Boolean)
    if (process.env.VERCEL_ENV !== 'production' && own.includes(hostname)) return true
    return !process.env.VERCEL && protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1')
  } catch {
    return false
  }
}

// Memoria de la instancia: límite por IP y solicitudes recientes (devuelve el mismo resultado ante un doble clic
// o un reintento del navegador). Es por instancia: con varias, la clave de idempotencia evita correos duplicados,
// pero no avisos de WhatsApp. Un límite compartido requiere el Firewall de Vercel (ver README).
const hits = new Map<string, number[]>()
const recent = new Map<string, { at: number; result: Promise<Response> }>()
const WINDOW = 10 * 60_000
const MAX_TRACKED = 5000

/** IPv6 se agrupa por /64 (un mismo cliente puede rotar direcciones dentro de su bloque). */
function clientKey(ip: string) {
  if (!ip.includes(':')) return ip
  const [head, tail = ''] = ip.split('::')
  const left = head ? head.split(':') : []
  const right = tail ? tail.split(':') : []
  const full = [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill('0'), ...right]
  return `${full.slice(0, 4).join(':')}::/64`
}

/** Segundos que faltan para que la IP vuelva a tener cupo, o 0 si tiene cupo. No registra el intento. */
function retryAfter(ip: string, max: number) {
  const now = Date.now()
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW)
  hits.set(ip, list)
  return list.length < max ? 0 : Math.ceil((list[0] + WINDOW - now) / 1000)
}

/** Registra una solicitud aceptada. Al llenarse la memoria borra lo vencido y, si no basta, lo más antiguo. */
function countHit(ip: string) {
  const now = Date.now()
  hits.set(ip, [...(hits.get(ip) ?? []).filter((t) => now - t < WINDOW), now])
  if (hits.size <= MAX_TRACKED) return
  for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW)) hits.delete(k)
  while (hits.size > MAX_TRACKED) hits.delete(hits.keys().next().value!)
}

const ascii = (b: Uint8Array, from: number, n: number) => String.fromCharCode(...b.subarray(from, from + n))
const latin1 = (b: Uint8Array) => new TextDecoder('latin1').decode(b)

/** Comprueba que el contenido corresponda a la extensión (no basta con renombrar un archivo). */
function matchesType(ext: string, b: Uint8Array) {
  switch (ext) {
    case 'pdf': return latin1(b.subarray(0, 1024)).includes('%PDF')
    case 'jpg': case 'jpeg': return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
    case 'png': return b[0] === 0x89 && ascii(b, 1, 3) === 'PNG'
    case 'heic': return ascii(b, 4, 4) === 'ftyp' && ['heic', 'heix', 'hevc', 'heim', 'heis', 'mif1', 'msf1'].includes(ascii(b, 8, 4))
    case 'docx': case 'xlsx': {
      // OOXML: un ZIP con [Content_Types].xml y la carpeta de Word (word/) o Excel (xl/).
      if (b[0] !== 0x50 || b[1] !== 0x4b) return false
      const names = latin1(b)
      return names.includes('[Content_Types].xml') && names.includes(ext === 'docx' ? 'word/' : 'xl/')
    }
    case 'dwg': return /^AC10\d\d/.test(ascii(b, 0, 6))
    case 'dxf': {
      const head = latin1(b.subarray(0, 1024))
      if (head.startsWith('AutoCAD Binary DXF')) return true
      // DXF de texto: empieza con el código 0 (SECTION) o un comentario 999, sin bytes nulos ni etiquetas HTML.
      return /^\s*(0|999)\s*\r?\n/.test(head) && !head.includes('\0') && !head.includes('<')
    }
    default: return false
  }
}

/** Nombre de archivo seguro: sin rutas, caracteres de control ni de formato (p. ej. U+202E, que disfraza la extensión). */
const safeName = (name: string) => name.normalize('NFC').replace(/[\p{Cc}\p{Cf}\\/:*?"<>|]+/gu, '_').slice(-120)

// --- Folio ------------------------------------------------------------------------------------

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const ymd = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Monterrey', year: '2-digit', month: '2-digit', day: '2-digit' }).format(d).replace(/-/g, '')

/**
 * COT-AAMMDD-XXXXXX. La parte final sale de la clave del envío y la fecha también, si la clave la trae
 * (el cotizador la crea como AAMMDD-uuid): un reintento después de medianoche conserva el mismo folio.
 */
async function folioFor(key: string, now: Date) {
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key)))
  const code = Array.from(hash.subarray(0, 6), (n) => ALPHABET[n % 32]).join('')
  const allowed = [-1, 0, 1].map((d) => ymd(new Date(now.getTime() + d * 86_400_000)))
  const fromKey = key.slice(0, 6)
  return `COT-${allowed.includes(fromKey) ? fromKey : ymd(now)}-${code}`
}

const shortHash = async (s: string) =>
  Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))).subarray(0, 4), (n) => n.toString(16).padStart(2, '0')).join('')

// --- Entrega ----------------------------------------------------------------------------------

async function deliver(q: Quote, cfg: Config): Promise<Outcome> {
  if (cfg.testDir) return writeTestOutput(q, cfg)
  const sales = salesEmail(q, cfg)
  const attachments = q.files.map((f) => ({ filename: f.name, content: f.content }))
  const sendSales = async (): Promise<Delivery> => {
    const first = await sendEmail(cfg, { to: cfg.email.to, replyTo: q.request.email.trim(), ...sales, attachments, key: `${q.folio}-ventas`, tag: 'cotizacion' })
    // Si Resend rechaza la solicitud (4xx), puede ser por el Reply-To del cliente: se reintenta una vez sin él.
    if (first.status !== 'error' || !/^HTTP 4(?!29)/.test(first.detail ?? '')) return first
    logError({ folio: q.folio, canal: 'correo', detalle: first.detail, accion: 'reintento sin reply_to' })
    return sendEmail(cfg, { to: cfg.email.to, ...sales, attachments, key: `${q.folio}-ventas-sin-reply`, tag: 'cotizacion', attempts: 2 })
  }
  const [email, whatsapp] = await Promise.all([
    emailReady(cfg) ? sendSales() : Promise.resolve<Delivery>({ status: 'no_configurado' }),
    whatsappReady(cfg) ? sendWhatsApp(cfg, q) : Promise.resolve<Delivery>({ status: 'no_configurado' }),
  ])
  // Recibida = llegó a ventas por al menos un canal. Si sólo llegó el WhatsApp, el cotizador lo dice (sin archivos
  // y con la descripción resumida). El acuse sólo se manda si de verdad se recibió.
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

const TEXT_FIELDS = ['site', 'location', 'description', 'name', 'company', 'email', 'phone', 'context'] as const
/** Campos de una sola línea: un salto de línea no debe poder inyectar renglones en el correo de texto. */
const SINGLE_LINE = new Set(['site', 'location', 'name', 'company', 'email', 'phone', 'context'])

export async function handlePost(request: Request): Promise<Response> {
  const cfg = getConfig()
  if (!receptionReady(cfg)) return reject(503, 'no_configurado', 'La recepción automática no está activa. Envíe su solicitud por WhatsApp o correo.')
  if (!allowedOrigin(request.headers.get('origin'), cfg)) return reject(403, 'origen', 'Solicitud no permitida.')
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('multipart/form-data')) return reject(400, 'formato', 'No pudimos leer la solicitud.')

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return reject(400, 'formato', 'No pudimos leer la solicitud.')
  }
  // FormData convierte cada salto de línea en CRLF: se normaliza para medir igual que el navegador.
  const text = (k: string) => {
    const v = form.get(k)
    if (typeof v !== 'string') return ''
    const clean = v.replace(/\r\n?/g, '\n')
    return SINGLE_LINE.has(k) ? singleLine(clean) : clean
  }

  // Un reintento de una solicitud ya procesada recibe su mismo resultado (antes de cualquier límite).
  const key = /^[A-Za-z0-9-]{16,64}$/.test(text('key')) ? text('key') : crypto.randomUUID()
  const cached = recent.get(key)
  if (cached && Date.now() - cached.at < 15 * 60_000) {
    try {
      return (await cached.result).clone()
    } catch {
      recent.delete(key)
    }
  }

  // Campo trampa (los bots lo llenan; las personas no lo ven) y tiempo mínimo de captura.
  if (text('hp_ref') || !(Number(text('elapsed')) >= 3000)) {
    log({ resultado: 'descartada_spam' })
    return reject(400, 'rechazada', 'No pudimos procesar la solicitud. Inténtelo de nuevo o envíela por WhatsApp.')
  }

  // Textos fuera de medida se rechazan antes de evaluar formatos.
  const tooLong = TEXT_FIELDS.find((k) => text(k).length > MAX_LENGTH[k])
  if (tooLong) return reject(413, 'invalida', 'Revise los datos de la solicitud.', { errores: { [tooLong]: `Use como máximo ${MAX_LENGTH[tooLong]} caracteres.` } })

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
  if (uploads.reduce((s, f) => s + f.size, 0) > FILES.totalBytes) return reject(413, 'archivos', `Los archivos superan ${FILES.totalBytes / 1048576} MB en total.`)
  const files: QuoteFile[] = []
  for (const f of uploads) {
    const ext = fileExtension(f.name)
    const bytes = new Uint8Array(await f.arrayBuffer())
    if (!FILES.extensions.includes(ext) || !matchesType(ext, bytes)) return reject(400, 'archivos', `El archivo «${safeName(f.name).slice(0, 80)}» no es de un tipo permitido o está dañado.`)
    files.push({ name: safeName(f.name), size: f.size, content: Buffer.from(bytes).toString('base64') })
  }

  // Límite por IP: sólo cuenta solicitudes válidas y no registra los intentos rechazados por exceso.
  const ip = clientKey(request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local')
  const wait = retryAfter(ip, cfg.rateLimit)
  if (wait) {
    log({ resultado: 'limite' })
    return reject(429, 'limite', 'Recibimos varias solicitudes desde su conexión. Espere unos minutos o envíela por WhatsApp.', {}, { 'Retry-After': String(wait) })
  }
  countHit(ip)

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
      if (d.status === 'error' || d.status === 'parcial') {
        // Sin datos personales; con lo necesario para saber qué se perdió si sólo llegó el WhatsApp.
        logError({ folio: quote.folio, canal, detalle: d.detail, archivos: files.length, descripcion_recortada: descriptionTrimmed(quote) })
      }
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
    logError({ canal: 'servidor', clave: await shortHash(key), detalle: e instanceof Error ? e.message : String(e) })
    return reject(500, 'servidor', 'Ocurrió un error al procesar la solicitud. Inténtelo de nuevo o envíela por WhatsApp o correo.')
  }
}
