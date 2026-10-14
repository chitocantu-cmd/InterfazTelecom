// Correos de la cotización (aviso a ventas y acuse al cliente) y envío por Resend.
// HTML con tablas y estilos en línea para que se vea igual en Outlook, Gmail y celulares.
import { COMPANY } from '../../src/data/company.js'
import { placeOf, quoteSubject, typeLabels, waNumber } from '../../src/lib/cotizacion.js'
import type { Config } from './config.js'
import type { Delivery, Quote } from './tipos.js'

const C = { navy: '#081D36', corp: '#0E4C92', ink: '#0E1C2D', body: '#3A4656', muted: '#616D7C', line: '#E1E6EB', mist: '#F4F6F8', green: '#15803D' }
const FONT = 'Arial, Helvetica, sans-serif'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const multiline = (s: string) => esc(s.trim()).replace(/\r?\n/g, '<br>')
const fmtSize = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

function layout(cfg: Config, band: string, preheader: string, content: string, footer: string) {
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(band)}</title></head>
<body style="margin:0;padding:0;background:${C.mist};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.mist};"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid ${C.line};font-family:${FONT};color:${C.ink};">
<tr><td style="padding:22px 28px;border-bottom:3px solid ${C.corp};">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="padding-right:14px;"><img src="${cfg.site}/email/interfaz-logo.png" width="64" height="57" alt="Interfaz Telecomunicaciones" style="display:block;border:0;"></td>
<td style="font-family:${FONT};"><div style="font-size:16px;font-weight:bold;color:${C.ink};">Interfaz Redes</div><div style="font-size:13px;color:${C.muted};">y Telecomunicaciones</div></td>
</tr></table></td></tr>
<tr><td style="background:${C.navy};padding:18px 28px;font-family:${FONT};font-size:15px;font-weight:bold;letter-spacing:1.5px;color:#ffffff;">${esc(band)}</td></tr>
${content}
<tr><td style="padding:18px 28px;border-top:1px solid ${C.line};font-family:${FONT};font-size:12px;line-height:18px;color:${C.muted};">${footer}</td></tr>
</table></td></tr></table></body></html>`
}

const section = (title: string, rows: string) => `<tr><td style="padding:22px 28px 4px;font-family:${FONT};">
<div style="font-size:12px;font-weight:bold;letter-spacing:1.2px;color:${C.corp};padding-bottom:8px;border-bottom:1px solid ${C.line};">${esc(title)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${FONT};font-size:14px;line-height:21px;">${rows}</table></td></tr>`

const row = (label: string, valueHtml: string) => `<tr><td valign="top" style="width:130px;padding:9px 12px 9px 0;color:${C.muted};border-bottom:1px solid ${C.line};">${esc(label)}</td><td valign="top" style="padding:9px 0;color:${C.ink};border-bottom:1px solid ${C.line};">${valueHtml}</td></tr>`

const button = (href: string, label: string, color: string) =>
  `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:11px 18px;background:${color};color:#ffffff;font-family:${FONT};font-size:14px;font-weight:bold;text-decoration:none;border-radius:2px;">${esc(label)}</a>`

const service = (q: Quote) => typeLabels(q.request.types).join(', ')
const fileNames = (q: Quote) => q.files.map((f) => f.name)

/** Aviso al equipo comercial. Reply-To es el cliente, así que "Responder" le contesta directamente. */
export function salesEmail(q: Quote, cfg: Config) {
  const r = q.request
  const wa = `https://wa.me/${waNumber(r.phone)}?text=${encodeURIComponent(`Hola ${r.name.trim()}, le escribimos de Interfaz Redes por su solicitud de cotización ${q.folio}.`)}`
  const reply = `mailto:${r.email.trim()}?subject=${encodeURIComponent(`Re: Solicitud de cotización ${q.folio}`)}`
  const files = q.files.length
    ? q.files.map((f) => `${esc(f.name)} <span style="color:${C.muted};">(${fmtSize(f.size)})</span>`).join('<br>') + `<br><span style="color:${C.muted};">Adjuntos a este correo.</span>`
    : `<span style="color:${C.muted};">Sin archivos</span>`

  const content = `<tr><td style="padding:20px 28px 0;font-family:${FONT};font-size:14px;line-height:21px;color:${C.body};">
<strong style="color:${C.ink};">Folio:</strong> <span style="font-family:Consolas,Menlo,monospace;color:${C.ink};">${esc(q.folio)}</span><br>
<strong style="color:${C.ink};">Fecha:</strong> ${esc(q.date)} (hora de Monterrey)</td></tr>
${section('DATOS DEL CLIENTE', [
  row('Nombre', esc(r.name.trim())),
  row('Empresa', esc(r.company.trim())),
  row('Correo', `<a href="mailto:${esc(r.email.trim())}" style="color:${C.corp};">${esc(r.email.trim())}</a>`),
  row('WhatsApp', `<a href="${esc(wa)}" style="color:${C.corp};">${esc(r.phone.trim())}</a>`),
  row('Ubicación', esc(placeOf(r))),
].join(''))}
${section('INFORMACIÓN DEL PROYECTO', [
  row('Servicio solicitado', esc(service(q))),
  r.context ? row('Referencia', esc(r.context)) : '',
  row('Descripción', multiline(r.description)),
  row('Archivos adjuntos', files),
].join(''))}
<tr><td style="padding:22px 28px 14px;font-family:${FONT};">
<div style="font-size:12px;font-weight:bold;letter-spacing:1.2px;color:${C.corp};padding-bottom:12px;border-bottom:1px solid ${C.line};margin-bottom:14px;">ACCIONES</div>
${button(reply, 'Responder al cliente', C.corp)}${button(wa, 'Contactar por WhatsApp', C.green)}
<div style="font-size:13px;line-height:19px;color:${C.muted};padding-top:6px;">Revise la descripción${q.files.length ? ' y los archivos adjuntos' : ''} antes de contactar al cliente. Al responder este correo, la respuesta llega directamente a ${esc(r.email.trim())}.</div>
</td></tr>`

  const text = [
    'NUEVA SOLICITUD DE COTIZACIÓN',
    '',
    `Folio: ${q.folio}`,
    `Fecha: ${q.date} (hora de Monterrey)`,
    '',
    'DATOS DEL CLIENTE',
    `Nombre: ${r.name.trim()}`,
    `Empresa: ${r.company.trim()}`,
    `Correo: ${r.email.trim()}`,
    `WhatsApp: ${r.phone.trim()}`,
    `Ubicación: ${placeOf(r)}`,
    '',
    'INFORMACIÓN DEL PROYECTO',
    `Servicio solicitado: ${service(q)}`,
    r.context ? `Referencia: ${r.context}` : null,
    `Descripción:\n${r.description.trim()}`,
    `Archivos adjuntos: ${q.files.length ? fileNames(q).join(', ') : 'Sin archivos'}`,
    '',
    'ACCIONES',
    `- Responder al correo del cliente: ${r.email.trim()}`,
    `- Contactar por WhatsApp: ${wa}`,
    '- Revisar la solicitud y los archivos adjuntos.',
  ].filter((l) => l !== null).join('\n')

  return {
    subject: quoteSubject(r),
    html: layout(cfg, 'NUEVA SOLICITUD DE COTIZACIÓN', `${q.folio} · ${r.company.trim()} · ${service(q)}`, content, `Enviado desde el cotizador de ${esc(cfg.site.replace(/^https?:\/\//, ''))}. Responder a este correo le contesta al cliente.`),
    text,
  }
}

/** Acuse de recibo para el cliente. No promete tiempos de respuesta. */
export function ackEmail(q: Quote, cfg: Config) {
  const r = q.request
  const first = r.name.trim().split(/\s+/)[0]
  const content = `<tr><td style="padding:24px 28px 6px;font-family:${FONT};font-size:15px;line-height:23px;color:${C.body};">
<p style="margin:0 0 14px;color:${C.ink};">Hola, ${esc(first)}:</p>
<p style="margin:0 0 14px;">Gracias por contactar a Interfaz Redes y Telecomunicaciones. Recibimos su solicitud de cotización; nuestro equipo comercial revisará la información de su proyecto para dar seguimiento a su solicitud.</p>
<p style="margin:0;">Si necesita agregar información o archivos, responda a este correo indicando su folio.</p></td></tr>
${section('SU SOLICITUD', [
  row('Folio', `<span style="font-family:Consolas,Menlo,monospace;">${esc(q.folio)}</span>`),
  row('Fecha', `${esc(q.date)} (hora de Monterrey)`),
  row('Servicio solicitado', esc(service(q))),
  row('Ubicación', esc(placeOf(r))),
].join(''))}
${section('CONTACTO', [
  row('WhatsApp / teléfono', esc(COMPANY.whatsappDisplay)),
  row('Correo', `<a href="mailto:${COMPANY.email}" style="color:${C.corp};">${COMPANY.email}</a>`),
  row('Oficina', esc(COMPANY.address)),
  row('Horario', esc(COMPANY.hours)),
  row('Sitio', `<a href="${cfg.site}/" style="color:${C.corp};">${esc(cfg.site.replace(/^https?:\/\//, ''))}</a>`),
].join(''))}
<tr><td style="padding:8px 0;"></td></tr>`

  const text = [
    `Hola, ${first}:`,
    '',
    'Gracias por contactar a Interfaz Redes y Telecomunicaciones. Recibimos su solicitud de cotización; nuestro equipo comercial revisará la información de su proyecto para dar seguimiento a su solicitud.',
    'Si necesita agregar información o archivos, responda a este correo indicando su folio.',
    '',
    `Folio: ${q.folio}`,
    `Fecha: ${q.date} (hora de Monterrey)`,
    `Servicio solicitado: ${service(q)}`,
    `Ubicación: ${placeOf(r)}`,
    '',
    `WhatsApp / teléfono: ${COMPANY.whatsappDisplay}`,
    `Correo: ${COMPANY.email}`,
    `Oficina: ${COMPANY.address}`,
    `Horario: ${COMPANY.hours}`,
    `${cfg.site}/`,
  ].join('\n')

  return {
    subject: `Recibimos su solicitud de cotización | Folio ${q.folio} | Interfaz Redes`,
    html: layout(cfg, 'SOLICITUD RECIBIDA', `Folio ${q.folio}: recibimos su solicitud de cotización.`, content, `Recibe este correo porque envió una solicitud de cotización en ${esc(cfg.site.replace(/^https?:\/\//, ''))}. Consulte nuestro <a href="${cfg.site}/aviso-de-privacidad" style="color:${C.muted};">aviso de privacidad</a>.`),
    text,
  }
}

interface Outgoing {
  to: string[]
  replyTo: string
  subject: string
  html: string
  text: string
  attachments?: { filename: string; content: string }[]
  /** Clave de idempotencia: un reintento con la misma clave no genera un segundo correo. */
  key: string
  tag: string
  /** Intentos como máximo (3 por omisión). */
  attempts?: number
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Envía por la API de Resend. Reintenta errores de red, 429 y 5xx; la clave de idempotencia evita duplicados. */
export async function sendEmail(cfg: Config, m: Outgoing): Promise<Delivery> {
  let last = ''
  const attempts = m.attempts ?? 3
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${cfg.email.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': m.key },
        body: JSON.stringify({
          from: cfg.email.from,
          to: m.to,
          reply_to: m.replyTo,
          subject: m.subject,
          html: m.html,
          text: m.text,
          attachments: m.attachments?.length ? m.attachments : undefined,
          tags: [{ name: 'tipo', value: m.tag }],
        }),
        signal: AbortSignal.timeout(8000),
      })
      if (res.ok) return { status: 'enviado', id: ((await res.json().catch(() => ({}))) as { id?: string }).id }
      // 409: la misma clave ya se usó, es decir, este correo ya salió en un intento anterior.
      if (res.status === 409) return { status: 'enviado', detail: 'duplicado evitado' }
      last = `HTTP ${res.status} ${(await res.text().catch(() => '')).slice(0, 200)}`
      if (res.status !== 429 && res.status < 500) break
    } catch (e) {
      last = e instanceof Error ? e.message : String(e)
    }
    if (attempt < attempts) await wait(attempt * 700)
  }
  return { status: 'error', detail: last }
}
