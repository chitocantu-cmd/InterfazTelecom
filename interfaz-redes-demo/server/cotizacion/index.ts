// Recepción de cotizaciones: valida, asigna folio, avisa a ventas por correo y WhatsApp,
// manda acuse al cliente y registra el estado de cada canal en los logs de Vercel.
import { isQuoteType } from '../../src/data/quote-types.js'
import { isLocale, type Locale } from '../../src/i18n/config.js'
import { FILES, MAX_LENGTH, SITES, fileExtension, quoteNotice, singleLine, validateQuote, validationText, type QuoteRequest } from '../../src/lib/cotizacion.js'
import { emailReady, getConfig, receptionReady, whatsappReady, type Config } from './config.js'
import { ackEmail, salesEmail, sendEmail } from './correo.js'
import type { Delivery, Quote, QuoteFile } from './tipos.js'
import { descriptionTrimmed, sendWhatsApp, templateParams } from './whatsapp.js'

interface Outcome { received: boolean; email: Delivery; whatsapp: Delivery; ack: Delivery }

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } })

const reject = (status: number, codigo: string, mensaje: string, extra: Record<string, unknown> = {}, headers: Record<string, string> = {}) =>
  json(status, { ok: false, codigo, mensaje, ...extra }, headers)

/** Mensajes al cliente en su idioma (traducciones pendientes de revisión lingüística). */
const MSG: Record<Locale, Record<'noConfig' | 'origin' | 'format' | 'spam' | 'invalid' | 'filesMax' | 'filesSize' | 'fileType' | 'limit' | 'delivery' | 'server', string>> = {
  es: {
    noConfig: 'La recepción automática no está activa. Envíe su solicitud por WhatsApp o correo.',
    origin: 'Solicitud no permitida.',
    format: 'No pudimos leer la solicitud.',
    spam: 'No pudimos procesar la solicitud. Inténtelo de nuevo o envíela por WhatsApp.',
    invalid: 'Revise los datos de la solicitud.',
    filesMax: `Adjunte como máximo ${FILES.max} archivos.`,
    filesSize: `Los archivos superan ${FILES.totalBytes / 1048576} MB en total.`,
    fileType: 'El archivo «{name}» no es de un tipo permitido o está dañado.',
    limit: 'Recibimos varias solicitudes desde su conexión. Espere unos minutos o envíela por WhatsApp.',
    delivery: 'No pudimos entregar su solicitud al equipo comercial. Inténtelo de nuevo o envíela por WhatsApp o correo.',
    server: 'Ocurrió un error al procesar la solicitud. Inténtelo de nuevo o envíela por WhatsApp o correo.',
  },
  en: {
    noConfig: 'Automatic reception is not active. Please send your request by WhatsApp or email.',
    origin: 'Request not allowed.',
    format: 'We could not read the request.',
    spam: 'We could not process the request. Please try again or send it by WhatsApp.',
    invalid: 'Please check the request details.',
    filesMax: `Attach ${FILES.max} files at most.`,
    filesSize: `The files exceed ${FILES.totalBytes / 1048576} MB in total.`,
    fileType: 'The file “{name}” is not an allowed type or is damaged.',
    limit: 'We received several requests from your connection. Please wait a few minutes or send it by WhatsApp.',
    delivery: 'We could not deliver your request to the sales team. Please try again or send it by WhatsApp or email.',
    server: 'An error occurred while processing the request. Please try again or send it by WhatsApp or email.',
  },
  ko: {
    noConfig: '자동 접수가 활성화되어 있지 않습니다. WhatsApp 또는 이메일로 요청을 보내 주세요.',
    origin: '허용되지 않은 요청입니다.',
    format: '요청을 읽을 수 없습니다.',
    spam: '요청을 처리할 수 없습니다. 다시 시도하시거나 WhatsApp으로 보내 주세요.',
    invalid: '요청 내용을 확인해 주세요.',
    filesMax: `파일은 최대 ${FILES.max}개까지 첨부할 수 있습니다.`,
    filesSize: `파일 합계가 ${FILES.totalBytes / 1048576}MB를 초과합니다.`,
    fileType: '“{name}” 파일은 허용되지 않는 형식이거나 손상되었습니다.',
    limit: '같은 연결에서 여러 요청이 접수되었습니다. 몇 분 후 다시 시도하시거나 WhatsApp으로 보내 주세요.',
    delivery: '영업팀에 요청을 전달하지 못했습니다. 다시 시도하시거나 WhatsApp 또는 이메일로 보내 주세요.',
    server: '요청을 처리하는 중 오류가 발생했습니다. 다시 시도하시거나 WhatsApp 또는 이메일로 보내 주세요.',
  },
  'zh-CN': {
    noConfig: '自动接收功能尚未启用。请通过 WhatsApp 或电子邮件发送您的需求。',
    origin: '不允许的请求。',
    format: '无法读取该请求。',
    spam: '无法处理该请求。请重试，或通过 WhatsApp 发送。',
    invalid: '请检查填写的信息。',
    filesMax: `最多可附加 ${FILES.max} 个文件。`,
    filesSize: `文件总大小超过 ${FILES.totalBytes / 1048576} MB。`,
    fileType: '文件“{name}”类型不允许或已损坏。',
    limit: '我们从您的网络连接收到了多次请求。请稍等几分钟，或通过 WhatsApp 发送。',
    delivery: '未能将您的需求送达销售团队。请重试，或通过 WhatsApp 或电子邮件发送。',
    server: '处理请求时出错。请重试，或通过 WhatsApp 或电子邮件发送。',
  },
}

const LOCALE_DATE: Record<Locale, string> = { es: 'es-MX', en: 'en-US', ko: 'ko-KR', 'zh-CN': 'zh-CN' }

/** Idioma de la solicitud (?lang= en la URL del envío; español si no viene o no es válido). */
function langOf(request: Request): Locale {
  try {
    const l = new URL(request.url).searchParams.get('lang')
    return isLocale(l) ? l : 'es'
  } catch {
    return 'es'
  }
}

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

/** Pausa entre envíos a Resend (límite de unas 2 solicitudes por segundo por cuenta). */
const RESEND_GAP_MS = 550
const pause = (ms: number) => new Promise((done) => setTimeout(done, ms))

async function deliver(q: Quote, cfg: Config): Promise<Outcome> {
  if (cfg.testDir) return writeTestOutput(q, cfg)
  const sales = salesEmail(q, cfg)
  const attachments = q.files.map((f) => ({ filename: f.name, content: f.content }))
  const sendSalesTo = async (to: string, n: number): Promise<Delivery> => {
    const key = `${q.folio}-ventas-${n}`
    const first = await sendEmail(cfg, { to: [to], replyTo: q.request.email.trim(), ...sales, attachments, key, tag: 'cotizacion' })
    // Si Resend rechaza la solicitud (4xx), puede ser por el Reply-To del cliente: se reintenta una vez sin él.
    if (first.status !== 'error' || !/^HTTP 4(?!29)/.test(first.detail ?? '')) return first
    logError({ folio: q.folio, canal: 'correo', destinatario: n, detalle: first.detail, accion: 'reintento sin reply_to' })
    return sendEmail(cfg, { to: [to], ...sales, attachments, key: `${key}-sin-reply`, tag: 'cotizacion', attempts: 2 })
  }
  // Un correo para cada destinatario (no uno con todos en «Para»): si un buzón lo filtra o lo rechaza, los demás lo
  // reciben igual, y en Resend se ve el estado de cada dirección. Uno tras otro: Resend admite unas 2 solicitudes
  // por segundo.
  const sendSales = async (): Promise<Delivery> => {
    const results: Delivery[] = []
    for (const [i, to] of cfg.email.to.entries()) {
      if (i > 0) await pause(RESEND_GAP_MS)
      results.push(await sendSalesTo(to, i + 1))
    }
    const failed = results.flatMap((r, i) => (r.status === 'enviado' ? [] : [`destinatario ${i + 1}: ${r.detail ?? r.status}`]))
    if (!failed.length) return { status: 'enviado' }
    return { status: failed.length < results.length ? 'parcial' : 'error', detail: failed.join(' | ') }
  }
  const [email, whatsapp] = await Promise.all([
    emailReady(cfg) ? sendSales() : Promise.resolve<Delivery>({ status: 'no_configurado' }),
    whatsappReady(cfg) ? sendWhatsApp(cfg, q) : Promise.resolve<Delivery>({ status: 'no_configurado' }),
  ])
  // Recibida = llegó a ventas por al menos un canal. Si sólo llegó el WhatsApp, el cotizador lo dice (sin archivos
  // y con la descripción resumida). El acuse sólo se manda si de verdad se recibió.
  const reached = (d: Delivery) => d.status === 'enviado' || d.status === 'parcial'
  const received = reached(email) || reached(whatsapp)
  if (received && cfg.email.ack && emailReady(cfg)) await pause(RESEND_GAP_MS)
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
  await writeFile(`${dir}/${q.folio}-ventas.txt`, `Para: ${cfg.email.to.join(', ')} (un correo a cada uno)\nDe: ${cfg.email.from}\nResponder a: ${q.request.email.trim()}\nAsunto: ${sales.subject}\nAdjuntos: ${files.join(', ') || '—'}\n\n${sales.text}\n`)
  await writeFile(`${dir}/${q.folio}-acuse.html`, ack.html)
  await writeFile(`${dir}/${q.folio}-acuse.txt`, `Para: ${q.request.email.trim()}\nResponder a: ${cfg.email.replyTo}\nAsunto: ${ack.subject}\n\n${ack.text}\n`)
  await writeFile(`${dir}/${q.folio}-whatsapp.txt`, `${quoteNotice(q.request, { files, folio: q.folio, date: q.date })}\n\nParámetros de la plantilla ${cfg.whatsapp.template}:\n${templateParams(q).map((p, i) => `{{${i + 1}}} ${p}`).join('\n')}\n`)
  const test: Delivery = { status: 'prueba' }
  return { received: true, email: test, whatsapp: test, ack: test }
}

// --- POST -------------------------------------------------------------------------------------

const TEXT_FIELDS = ['site', 'location', 'description', 'name', 'company', 'role', 'email', 'phone', 'context', 'summary'] as const
/** Campos de una sola línea: un salto de línea no debe poder inyectar renglones en el correo de texto. */
const SINGLE_LINE = new Set(['site', 'location', 'name', 'company', 'role', 'email', 'phone', 'context'])

export async function handlePost(request: Request): Promise<Response> {
  const cfg = getConfig()
  const lang = langOf(request)
  const m = MSG[lang]
  if (!receptionReady(cfg)) return reject(503, 'no_configurado', m.noConfig)
  if (!allowedOrigin(request.headers.get('origin'), cfg)) return reject(403, 'origen', m.origin)
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('multipart/form-data')) return reject(400, 'formato', m.format)

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return reject(400, 'formato', m.format)
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
    return reject(400, 'rechazada', m.spam)
  }

  // Textos fuera de medida se rechazan antes de evaluar formatos.
  const tooLong = TEXT_FIELDS.find((k) => text(k).length > MAX_LENGTH[k])
  if (tooLong) return reject(413, 'invalida', m.invalid, { errores: { [tooLong]: validationText(lang).max(MAX_LENGTH[tooLong]) } })

  const types = [...new Set(form.getAll('types'))].filter(isQuoteType)
  const req: QuoteRequest = {
    types,
    site: SITES.includes(text('site')) ? text('site') : '',
    location: text('location'),
    description: text('description'),
    name: text('name'),
    company: text('company'),
    role: text('role').trim() || undefined,
    email: text('email'),
    phone: text('phone'),
    context: text('context').trim() || undefined,
    summary: text('summary').trim() || undefined,
    lang,
  }
  const errors = validateQuote(req)
  if (Object.keys(errors).length) return reject(400, 'invalida', m.invalid, { errores: errors })

  const uploads = form.getAll('files').filter((f): f is File => typeof f !== 'string')
  if (uploads.length > FILES.max) return reject(400, 'archivos', m.filesMax)
  if (uploads.reduce((s, f) => s + f.size, 0) > FILES.totalBytes) return reject(413, 'archivos', m.filesSize)
  const files: QuoteFile[] = []
  for (const f of uploads) {
    const ext = fileExtension(f.name)
    const bytes = new Uint8Array(await f.arrayBuffer())
    if (!FILES.extensions.includes(ext) || !matchesType(ext, bytes)) return reject(400, 'archivos', m.fileType.replace('{name}', safeName(f.name).slice(0, 80)))
    files.push({ name: safeName(f.name), size: f.size, content: Buffer.from(bytes).toString('base64') })
  }

  // Límite por IP: sólo cuenta solicitudes válidas y no registra los intentos rechazados por exceso.
  const ip = clientKey(request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local')
  const wait = retryAfter(ip, cfg.rateLimit)
  if (wait) {
    log({ resultado: 'limite' })
    return reject(429, 'limite', m.limit, {}, { 'Retry-After': String(wait) })
  }
  countHit(ip)

  const result = (async () => {
    const now = new Date()
    const quote: Quote = {
      folio: await folioFor(key, now),
      date: new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Monterrey', dateStyle: 'long', timeStyle: 'short' }).format(now),
      localDate: new Intl.DateTimeFormat(LOCALE_DATE[lang], { timeZone: 'America/Monterrey', dateStyle: 'long', timeStyle: 'short' }).format(now),
      request: req,
      files,
    }
    const out = await deliver(quote, cfg)
    log({ folio: quote.folio, recibida: out.received, correo: out.email.status, whatsapp: out.whatsapp.status, acuse: out.ack.status, archivos: files.length, tipos: req.types, idioma: lang, explorador: Boolean(req.summary) })
    for (const [canal, d] of Object.entries({ correo: out.email, whatsapp: out.whatsapp, acuse: out.ack })) {
      if (d.status === 'error' || d.status === 'parcial') {
        // Sin datos personales; con lo necesario para saber qué se perdió si sólo llegó el WhatsApp.
        logError({ folio: quote.folio, canal, detalle: d.detail, archivos: files.length, descripcion_recortada: descriptionTrimmed(quote) })
      }
    }
    const estados = { correo: out.email.status, whatsapp: out.whatsapp.status, acuse: out.ack.status }
    if (!out.received) {
      recent.delete(key) // permite reintentar
      return reject(502, 'entrega', m.delivery, { estados })
    }
    return json(200, { ok: true, folio: quote.folio, fecha: quote.localDate, estados })
  })()
  recent.set(key, { at: Date.now(), result })
  if (recent.size > 500) recent.delete(recent.keys().next().value!)
  try {
    return (await result).clone()
  } catch (e) {
    recent.delete(key)
    logError({ canal: 'servidor', clave: await shortHash(key), detalle: e instanceof Error ? e.message : String(e) })
    return reject(500, 'servidor', m.server)
  }
}
