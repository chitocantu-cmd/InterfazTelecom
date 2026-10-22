// Correos de la cotización (aviso a ventas y acuse al cliente) y envío por Resend.
// HTML con tablas y estilos en línea para que se vea igual en Outlook, Gmail y celulares.
// El aviso a ventas va en español; el acuse, en el idioma en que navegaba el cliente.
import { COMPANY } from '../../src/data/company.js'
import type { Locale } from '../../src/i18n/config.js'
import { LANGUAGE_NAME_ES, placeOf, quoteSubject, siteLabel, typeLabels, waNumber } from '../../src/lib/cotizacion.js'
import type { Config } from './config.js'
import type { Delivery, Quote } from './tipos.js'

const C = { navy: '#081D36', corp: '#0E4C92', ink: '#0E1C2D', body: '#3A4656', muted: '#616D7C', line: '#E1E6EB', mist: '#F4F6F8', green: '#15803D' }
const FONT = 'Arial, Helvetica, sans-serif'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const multiline = (s: string) => esc(s.trim()).replace(/\r?\n/g, '<br>')
const fmtSize = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

function layout(cfg: Config, band: string, preheader: string, content: string, footer: string, lang = 'es') {
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(band)}</title></head>
<body style="margin:0;padding:0;background:${C.mist};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.mist};"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid ${C.line};font-family:${FONT};color:${C.ink};">
<tr><td style="padding:22px 28px;border-bottom:3px solid ${C.corp};">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="padding-right:14px;"><img src="${cfg.site}/email/interfaz-logo.png" width="64" height="57" alt="Interfaz Redes y Telecomunicaciones" style="display:block;border:0;"></td>
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
const langOf = (q: Quote): Locale => q.request.lang ?? 'es'

/** Aviso al equipo comercial. Reply-To es el cliente, así que "Responder" le contesta directamente. */
export function salesEmail(q: Quote, cfg: Config) {
  const r = q.request
  const lang = langOf(q)
  const foreign = lang !== 'es'
  const wa = `https://wa.me/${waNumber(r.phone)}?text=${encodeURIComponent(`Hola ${r.name.trim()}, le escribimos de Interfaz Redes por su solicitud de cotización ${q.folio}.`)}`
  const reply = `mailto:${encodeURIComponent(r.email.trim())}?subject=${encodeURIComponent(`Re: Solicitud de cotización ${q.folio}`)}`
  const files = q.files.length
    ? q.files.map((f) => `${esc(f.name)} <span style="color:${C.muted};">(${fmtSize(f.size)})</span>`).join('<br>') +
      `<br><span style="color:${C.muted};">Adjuntos a este correo. Los envió una persona externa: ábralos sólo si esperaba esta solicitud.</span>`
    : `<span style="color:${C.muted};">Sin archivos</span>`

  const content = `<tr><td style="padding:20px 28px 0;font-family:${FONT};font-size:14px;line-height:21px;color:${C.body};">
<strong style="color:${C.ink};">Folio:</strong> <span style="font-family:Consolas,Menlo,monospace;color:${C.ink};">${esc(q.folio)}</span><br>
<strong style="color:${C.ink};">Fecha:</strong> ${esc(q.date)} (hora de Monterrey)${foreign ? `<br><strong style="color:${C.ink};">Idioma del cliente:</strong> ${esc(LANGUAGE_NAME_ES[lang])} <span style="color:${C.muted};">(navegó el sitio en ese idioma; el acuse le llegó en ese idioma)</span>` : ''}</td></tr>
${section('DATOS DEL CLIENTE', [
  row('Nombre', esc(r.name.trim())),
  r.role ? row('Cargo', esc(r.role.trim())) : '',
  row('Empresa', esc(r.company.trim())),
  row('Correo', `<a href="mailto:${esc(encodeURIComponent(r.email.trim()))}" style="color:${C.corp};">${esc(r.email.trim())}</a>`),
  row('WhatsApp', `<a href="${esc(wa)}" style="color:${C.corp};">${esc(r.phone.trim())}</a>`),
  row('Ubicación', esc(placeOf(r))),
].join(''))}
${section('INFORMACIÓN DEL PROYECTO', [
  row('Servicio solicitado', esc(service(q))),
  r.context ? row('Referencia', esc(r.context)) : '',
  row('Descripción', multiline(r.description)),
  r.summary ? row('Explorador de soluciones', multiline(r.summary)) : '',
  row('Archivos adjuntos', files),
].join(''))}
<tr><td style="padding:22px 28px 14px;font-family:${FONT};">
<div style="font-size:12px;font-weight:bold;letter-spacing:1.2px;color:${C.corp};padding-bottom:12px;border-bottom:1px solid ${C.line};margin-bottom:14px;">ACCIONES</div>
${button(reply, 'Responder al cliente', C.corp)}${button(wa, 'Contactar por WhatsApp', C.green)}
<div style="font-size:13px;line-height:19px;color:${C.muted};padding-top:6px;">Revise la descripción${q.files.length ? ' y los archivos adjuntos' : ''} antes de contactar al cliente. Al responder este correo, la respuesta llega directamente a ${esc(r.email.trim())}.${foreign ? ` El cliente escribió desde la versión en ${esc(LANGUAGE_NAME_ES[lang].toLowerCase())} del sitio: conviene responderle en ese idioma o en inglés.` : ''}</div>
</td></tr>`

  const text = [
    'NUEVA SOLICITUD DE COTIZACIÓN',
    '',
    `Folio: ${q.folio}`,
    `Fecha: ${q.date} (hora de Monterrey)`,
    foreign ? `Idioma del cliente: ${LANGUAGE_NAME_ES[lang]}` : null,
    '',
    'DATOS DEL CLIENTE',
    `Nombre: ${r.name.trim()}`,
    r.role ? `Cargo: ${r.role.trim()}` : null,
    `Empresa: ${r.company.trim()}`,
    `Correo: ${r.email.trim()}`,
    `WhatsApp: ${r.phone.trim()}`,
    `Ubicación: ${placeOf(r)}`,
    '',
    'INFORMACIÓN DEL PROYECTO',
    `Servicio solicitado: ${service(q)}`,
    r.context ? `Referencia: ${r.context}` : null,
    `Descripción:\n${r.description.trim()}`,
    r.summary ? `Explorador de soluciones:\n${r.summary.trim()}` : null,
    `Archivos adjuntos: ${q.files.length ? `${fileNames(q).join(', ')} (los envió una persona externa: ábralos sólo si esperaba esta solicitud)` : 'Sin archivos'}`,
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

/** Textos del acuse por idioma (traducciones pendientes de revisión lingüística). */
const ACK: Record<Locale, {
  greeting: (name: string) => string; greetingPlain: string; thanks: string; addInfo: string; band: string; preheader: (folio: string) => string
  yourRequest: string; folio: string; date: string; timezone: string; service: string; site: string; contact: string; phone: string; email: string
  office: string; hours: string; hoursValue: string; site2: string; subject: (folio: string) => string; footer: (site: string, privacy: string) => string; privacy: string
  privacyPath: string
}> = {
  es: {
    greeting: (n) => `Hola, ${n}:`, greetingPlain: 'Hola:',
    thanks: 'Gracias por contactar a Interfaz Redes y Telecomunicaciones. Recibimos su solicitud de cotización; nuestro equipo comercial revisará la información de su proyecto para dar seguimiento a su solicitud.',
    addInfo: 'Si necesita agregar información o archivos, responda a este correo indicando su folio.',
    band: 'SOLICITUD RECIBIDA', preheader: (f) => `Folio ${f}: recibimos su solicitud de cotización.`,
    yourRequest: 'SU SOLICITUD', folio: 'Folio', date: 'Fecha', timezone: '(hora de Monterrey)', service: 'Servicio solicitado', site: 'Tipo de inmueble',
    contact: 'CONTACTO', phone: 'WhatsApp / teléfono', email: 'Correo', office: 'Oficina', hours: 'Horario', hoursValue: COMPANY.hours, site2: 'Sitio',
    subject: (f) => `Recibimos su solicitud de cotización | Folio ${f} | Interfaz Redes`,
    footer: (s, p) => `Recibe este correo porque envió una solicitud de cotización en ${s}. Consulte nuestro ${p}.`, privacy: 'aviso de privacidad', privacyPath: '/aviso-de-privacidad',
  },
  en: {
    greeting: (n) => `Hello ${n},`, greetingPlain: 'Hello,',
    thanks: 'Thank you for contacting Interfaz Redes y Telecomunicaciones. We received your quote request; our sales team will review your project information and follow up on your request.',
    addInfo: 'If you need to add information or files, reply to this email and include your reference number.',
    band: 'REQUEST RECEIVED', preheader: (f) => `Reference ${f}: we received your quote request.`,
    yourRequest: 'YOUR REQUEST', folio: 'Reference', date: 'Date', timezone: '(Monterrey time)', service: 'Requested service', site: 'Facility type',
    contact: 'CONTACT', phone: 'WhatsApp / phone', email: 'Email', office: 'Office', hours: 'Business hours', hoursValue: 'Monday to Friday, 8:00 to 18:00 (Monterrey time)', site2: 'Website',
    subject: (f) => `We received your quote request | Reference ${f} | Interfaz Redes`,
    footer: (s, p) => `You are receiving this email because you submitted a quote request at ${s}. See our ${p} (in Spanish).`, privacy: 'privacy notice', privacyPath: '/en/aviso-de-privacidad',
  },
  ko: {
    greeting: (n) => `${n}님, 안녕하세요.`, greetingPlain: '안녕하세요.',
    thanks: 'Interfaz Redes y Telecomunicaciones에 문의해 주셔서 감사합니다. 견적 요청을 접수했습니다. 영업팀이 프로젝트 정보를 검토한 후 연락드리겠습니다.',
    addInfo: '정보나 파일을 추가하시려면 접수 번호를 적어 이 이메일에 회신해 주세요.',
    band: '요청 접수 완료', preheader: (f) => `접수 번호 ${f}: 견적 요청을 접수했습니다.`,
    yourRequest: '요청 내용', folio: '접수 번호', date: '일시', timezone: '(몬테레이 시간)', service: '요청 서비스', site: '시설 유형',
    contact: '연락처', phone: 'WhatsApp / 전화', email: '이메일', office: '사무소', hours: '업무 시간', hoursValue: '월–금, 8:00–18:00 (몬테레이 시간)', site2: '웹사이트',
    subject: (f) => `견적 요청이 접수되었습니다 | 접수 번호 ${f} | Interfaz Redes`,
    footer: (s, p) => `${s}에서 견적을 요청하셨기 때문에 이 이메일을 받으셨습니다. ${p}(스페인어)을 확인해 주세요.`, privacy: '개인정보 처리방침', privacyPath: '/ko/aviso-de-privacidad',
  },
  'zh-CN': {
    greeting: (n) => `${n}，您好：`, greetingPlain: '您好：',
    thanks: '感谢您联系 Interfaz Redes y Telecomunicaciones。我们已收到您的报价申请，销售团队将审阅您的项目信息并与您跟进。',
    addInfo: '如需补充信息或文件，请回复此邮件并注明您的编号。',
    band: '申请已收到', preheader: (f) => `编号 ${f}：我们已收到您的报价申请。`,
    yourRequest: '您的申请', folio: '编号', date: '日期', timezone: '（蒙特雷时间）', service: '申请的服务', site: '设施类型',
    contact: '联系方式', phone: 'WhatsApp / 电话', email: '电子邮件', office: '办公室', hours: '工作时间', hoursValue: '周一至周五 8:00–18:00（蒙特雷时间）', site2: '网站',
    subject: (f) => `我们已收到您的报价申请 | 编号 ${f} | Interfaz Redes`,
    footer: (s, p) => `您收到此邮件是因为您在 ${s} 提交了报价申请。请查看我们的${p}（西班牙语）。`, privacy: '隐私声明', privacyPath: '/zh-CN/aviso-de-privacidad',
  },
}

/**
 * Acuse de recibo para el cliente, en el idioma en que navegaba. No promete tiempos de respuesta. Como cualquiera
 * puede escribir el correo de otra persona en el formulario, el acuse no repite texto libre: el saludo usa el nombre
 * sólo si son letras, y del lugar sólo muestra el tipo de inmueble (opciones fijas), no la ubicación escrita.
 */
export function ackEmail(q: Quote, cfg: Config) {
  const r = q.request
  const lang = langOf(q)
  const a = ACK[lang]
  const name = r.name.trim().split(/\s+/)[0]
  const greeting = /^[\p{L}'-]{2,30}$/u.test(name) ? a.greeting(name) : a.greetingPlain
  const services = typeLabels(r.types, lang).join(', ')
  const host = cfg.site.replace(/^https?:\/\//, '')
  const content = `<tr><td style="padding:24px 28px 6px;font-family:${FONT};font-size:15px;line-height:23px;color:${C.body};">
<p style="margin:0 0 14px;color:${C.ink};">${esc(greeting)}</p>
<p style="margin:0 0 14px;">${esc(a.thanks)}</p>
<p style="margin:0;">${esc(a.addInfo)}</p></td></tr>
${section(a.yourRequest, [
  row(a.folio, `<span style="font-family:Consolas,Menlo,monospace;">${esc(q.folio)}</span>`),
  row(a.date, `${esc(q.localDate)} ${esc(a.timezone)}`),
  row(a.service, esc(services)),
  r.site ? row(a.site, esc(siteLabel(r.site, lang))) : '',
].join(''))}
${section(a.contact, [
  row(a.phone, `${esc(COMPANY.whatsappDisplay)} · ${esc(COMPANY.phoneAlt.display)}`),
  row(a.email, `<a href="mailto:${COMPANY.email}" style="color:${C.corp};">${COMPANY.email}</a> · <a href="mailto:${COMPANY.emailAlt}" style="color:${C.corp};">${COMPANY.emailAlt}</a>`),
  row(a.office, esc(COMPANY.address)),
  row(a.hours, esc(a.hoursValue)),
  row(a.site2, `<a href="${cfg.site}/" style="color:${C.corp};">${esc(host)}</a>`),
].join(''))}
<tr><td style="padding:8px 0;"></td></tr>`

  const text = [
    greeting,
    '',
    a.thanks,
    a.addInfo,
    '',
    `${a.folio}: ${q.folio}`,
    `${a.date}: ${q.localDate} ${a.timezone}`,
    `${a.service}: ${services}`,
    r.site ? `${a.site}: ${siteLabel(r.site, lang)}` : null,
    '',
    `${a.phone}: ${COMPANY.whatsappDisplay} · ${COMPANY.phoneAlt.display}`,
    `${a.email}: ${COMPANY.email} · ${COMPANY.emailAlt}`,
    `${a.office}: ${COMPANY.address}`,
    `${a.hours}: ${a.hoursValue}`,
    `${cfg.site}/`,
  ].filter((l) => l !== null).join('\n')

  return {
    subject: a.subject(q.folio),
    html: layout(cfg, a.band, a.preheader(q.folio), content, a.footer(esc(host), `<a href="${cfg.site}${a.privacyPath}" style="color:${C.muted};">${esc(a.privacy)}</a>`), lang),
    text,
  }
}

interface Outgoing {
  to: string[]
  /** Sin Reply-To si se omite. */
  replyTo?: string
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
      if (res.status === 409) {
        const { name } = (await res.json().catch(() => ({}))) as { name?: string }
        // Otro intento con la misma clave sigue en curso: se espera y se vuelve a preguntar con la misma clave.
        if (name === 'concurrent_idempotent_requests') {
          last = 'HTTP 409 concurrent_idempotent_requests'
          if (attempt < attempts) await wait(attempt * 700)
          continue
        }
        // La clave ya se usó: Resend aceptó este correo en un intento anterior. El contenido sólo difiere en la
        // hora (la clave cambia si el cliente edita la solicitud), así que no se reenvía.
        return { status: 'enviado', detail: `duplicado evitado (${name ?? '409'})` }
      }
      last = `HTTP ${res.status} ${(await res.text().catch(() => '')).slice(0, 200)}`
      if (res.status !== 429 && res.status < 500) break
    } catch (e) {
      last = e instanceof Error ? e.message : String(e)
    }
    if (attempt < attempts) await wait(attempt * 700)
  }
  return { status: 'error', detail: last }
}
