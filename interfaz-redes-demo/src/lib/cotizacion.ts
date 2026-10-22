// Solicitud de cotización: campos, límites, validación y textos. Lo comparten el cotizador
// (navegador) y la función /api/cotizacion (servidor), para que los dos validen y redacten igual.
// Las importaciones llevan .js porque en Vercel la función corre como módulo ES de Node.
import { isLocale, type Locale } from '../i18n/config.js'
import { QUOTE_TYPES, quoteTypesFor, type QuoteType } from '../data/quote-types.js'

/** Tipos de inmueble. El valor en español es el que viaja y se valida; las etiquetas traducidas sólo se muestran. */
export const SITES = ['Planta industrial', 'Oficinas / corporativo', 'CEDIS / almacén', 'Institución educativa', 'Comercio / edificio', 'Otro']

export const SITE_TEXT: Record<Exclude<Locale, 'es'>, string[]> = {
  en: ['Industrial plant', 'Offices / corporate', 'Distribution center / warehouse', 'Educational institution', 'Retail / building', 'Other'],
  ko: ['산업 공장', '사무실 / 기업', '물류센터 / 창고', '교육 기관', '상업 시설 / 건물', '기타'],
  'zh-CN': ['工业厂房', '办公室 / 企业总部', '物流中心 / 仓库', '教育机构', '商业 / 楼宇', '其他'],
}

/** Etiqueta del tipo de inmueble en el idioma pedido. */
export const siteLabel = (site: string, locale: Locale) => (locale === 'es' ? site : SITE_TEXT[locale][SITES.indexOf(site)] ?? site)

export interface QuoteRequest {
  types: QuoteType[]
  site: string
  location: string
  description: string
  name: string
  company: string
  /** Cargo, opcional. */
  role?: string
  email: string
  phone: string
  /** Servicio o necesidad desde donde se abrió el cotizador (en español: lo lee el equipo comercial). */
  context?: string
  /** Resumen del explorador de soluciones (en español), si la solicitud viene de ahí. */
  summary?: string
  /** Idioma en el que navegaba el cliente: el acuse y los mensajes salen en ese idioma. */
  lang?: Locale
}

export type QuoteField = keyof QuoteRequest
type TextField = Exclude<QuoteField, 'types' | 'lang'>

/** Longitud máxima de cada campo de texto (los campos la respetan y el servidor la vuelve a revisar). */
export const MAX_LENGTH: Record<TextField, number> = { site: 40, location: 160, description: 4000, name: 120, company: 160, role: 120, email: 254, phone: 25, context: 160, summary: 2000 }

/**
 * Archivos adjuntos: viajan con la solicitud y llegan adjuntos al correo de ventas; el sitio no los guarda.
 * Vercel acepta hasta 4.5 MB por solicitud, de ahí el total de 4 MB.
 */
export const FILES = { max: 5, totalBytes: 4 * 1024 * 1024, extensions: ['pdf', 'dwg', 'dxf', 'jpg', 'jpeg', 'png', 'heic', 'xlsx', 'docx'] }
export const FILE_ACCEPT = FILES.extensions.map((e) => `.${e}`).join(',')
export const fileExtension = (name: string) => name.split('.').pop()?.toLowerCase() ?? ''

// Lineal (sin retroceso costoso aunque llegue un texto enorme) y estricta: sin espacios, <>, ?, &, ni puntos dobles o finales.
const EMAIL = /^[A-Za-z0-9._+'-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/
const PHONE = /^\+?[\d\s().-]{10,25}$/
const TEXT_FIELDS = Object.keys(MAX_LENGTH) as TextField[]

/** Mensajes de validación por idioma (traducciones pendientes de revisión lingüística). */
const VALIDATION: Record<Locale, {
  max: (n: number) => string; types: string; location: string; description: string; descriptionOwn: string
  name: string; company: string; email: string; phoneDigits: string; phoneFormat: string
}> = {
  es: {
    max: (n) => `Use como máximo ${n} caracteres.`,
    types: 'Seleccione al menos una opción.',
    location: 'Indique la ciudad o zona del proyecto.',
    description: 'Describa la necesidad en al menos una frase (15 caracteres).',
    descriptionOwn: 'Agregue los detalles de su proyecto (al menos 15 caracteres).',
    name: 'Escriba su nombre.',
    company: 'Escriba el nombre de la empresa.',
    email: 'Revise el formato del correo, por ejemplo nombre@empresa.com.',
    phoneDigits: 'Escriba un número de 10 dígitos.',
    phoneFormat: 'Use sólo números, espacios, guiones o paréntesis (hasta 15 dígitos).',
  },
  en: {
    max: (n) => `Use ${n} characters at most.`,
    types: 'Select at least one option.',
    location: 'Enter the city or area of the project.',
    description: 'Describe your need in at least one sentence (15 characters).',
    descriptionOwn: 'Add the details of your project (at least 15 characters).',
    name: 'Enter your name.',
    company: 'Enter your company name.',
    email: 'Check the email format, for example name@company.com.',
    phoneDigits: 'Enter a number with at least 10 digits.',
    phoneFormat: 'Use only numbers, spaces, hyphens or parentheses (up to 15 digits).',
  },
  ko: {
    max: (n) => `최대 ${n}자까지 입력할 수 있습니다.`,
    types: '하나 이상 선택해 주세요.',
    location: '프로젝트가 있는 도시나 지역을 입력해 주세요.',
    description: '필요한 내용을 한 문장 이상(15자 이상) 입력해 주세요.',
    descriptionOwn: '프로젝트 세부 내용을 추가해 주세요(15자 이상).',
    name: '이름을 입력해 주세요.',
    company: '회사명을 입력해 주세요.',
    email: '이메일 형식을 확인해 주세요. 예: name@company.com',
    phoneDigits: '10자리 이상의 번호를 입력해 주세요.',
    phoneFormat: '숫자, 공백, 하이픈, 괄호만 사용해 주세요(최대 15자리).',
  },
  'zh-CN': {
    max: (n) => `最多 ${n} 个字符。`,
    types: '请至少选择一项。',
    location: '请填写项目所在的城市或区域。',
    description: '请至少用一句话描述需求（不少于 15 个字符）。',
    descriptionOwn: '请补充项目详情（不少于 15 个字符）。',
    name: '请填写您的姓名。',
    company: '请填写公司名称。',
    email: '请检查邮箱格式，例如 name@company.com。',
    phoneDigits: '请填写至少 10 位数字的号码。',
    phoneFormat: '只能使用数字、空格、连字符或括号（最多 15 位数字）。',
  },
}

export const validationText = (locale: Locale = 'es') => VALIDATION[locale]

/** Errores por campo; vacío si la solicitud está completa. Los mensajes salen en el idioma de la solicitud. */
export function validateQuote(r: QuoteRequest): Partial<Record<QuoteField, string>> {
  const m = VALIDATION[isLocale(r.lang) ? r.lang : 'es']
  const e: Partial<Record<QuoteField, string>> = {}
  // Longitudes primero: un campo excedido se rechaza sin evaluar su formato.
  for (const k of TEXT_FIELDS) if ((r[k]?.length ?? 0) > MAX_LENGTH[k]) e[k] = m.max(MAX_LENGTH[k])
  if (!r.types.length) e.types = m.types
  if (!e.location && r.location.trim().length < 3) e.location = m.location
  if (!e.description && r.description.trim().length < 15) e.description = m.description
  if (!e.name && r.name.trim().length < 3) e.name = m.name
  if (!e.company && r.company.trim().length < 2) e.company = m.company
  if (!e.email && !EMAIL.test(r.email.trim())) e.email = m.email
  if (!e.phone) {
    const digits = r.phone.replace(/\D/g, '').length
    if (digits < 10) e.phone = m.phoneDigits
    else if (digits > 15 || !PHONE.test(r.phone.trim())) e.phone = m.phoneFormat
  }
  return e
}

/** Campos de una línea: saltos, tabuladores y separadores Unicode se vuelven un espacio (no inyectan renglones). */
export const singleLine = (s: string) => s.replace(/[\r\n\t\u2028\u2029]+/g, ' ')

/** Etiquetas de los tipos (en español por omisión: es lo que lee el equipo comercial). */
export const typeLabels = (types: QuoteType[], locale: Locale = 'es') => {
  const list = locale === 'es' ? QUOTE_TYPES : quoteTypesFor(locale)
  return types.map((t) => list.find((q) => q.id === t)?.label ?? t)
}

/** Número para wa.me: los de 10 dígitos se toman como mexicanos (+52). */
export function waNumber(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits.length === 10 ? `52${digits}` : digits
}

/** Ubicación tal como se muestra en los avisos: tipo de inmueble y ciudad. */
export const placeOf = (r: QuoteRequest) => [r.site, r.location.trim()].filter(Boolean).join(' · ')

/** Nombre del idioma en español, para el equipo comercial. */
export const LANGUAGE_NAME_ES: Record<Locale, string> = { es: 'Español', en: 'Inglés', ko: 'Coreano', 'zh-CN': 'Chino simplificado' }

/**
 * Aviso de la solicitud con el formato que recibe el equipo comercial por WhatsApp. Se usa para el
 * envío manual (botón que abre WhatsApp) y repite los datos de la plantilla del aviso automático.
 * Va en español: lo lee el equipo comercial en Monterrey.
 */
export function quoteNotice(r: QuoteRequest, opts: { files: string[]; folio?: string; date?: string }): string {
  return [
    '*NUEVA COTIZACIÓN — INTERFAZ REDES*',
    opts.folio || opts.date ? '' : null,
    opts.folio ? `Folio: ${opts.folio}` : null,
    opts.date ? `Fecha: ${opts.date}` : null,
    '',
    `*Cliente:* ${r.name.trim()}`,
    r.role?.trim() ? `*Cargo:* ${r.role.trim()}` : null,
    `*Empresa:* ${r.company.trim()}`,
    `*Servicio:* ${typeLabels(r.types).join(', ')}`,
    r.context ? `*Referencia:* ${r.context}` : null,
    `*Ubicación:* ${placeOf(r)}`,
    `*WhatsApp:* ${r.phone.trim()}`,
    `*Correo:* ${r.email.trim()}`,
    r.lang && r.lang !== 'es' ? `*Idioma del cliente:* ${LANGUAGE_NAME_ES[r.lang]}` : null,
    '',
    '*Descripción del proyecto:*',
    r.description.trim(),
    r.summary ? '' : null,
    r.summary ? '*Resumen del explorador:*' : null,
    r.summary ? r.summary.trim() : null,
    opts.files.length ? '' : null,
    opts.files.length ? '*Archivos:*' : null,
    opts.files.length ? (opts.folio ? `${opts.files.join(', ')} (adjuntos al correo de la solicitud)` : `${opts.files.join(', ')} (los comparto en este chat)`) : null,
  ]
    .filter((l) => l !== null)
    .join('\n')
}

export const quoteSubject = (r: QuoteRequest) => `Nueva solicitud de cotización | Interfaz Redes | ${typeLabels(r.types).join(', ') || 'Proyecto'}${r.lang && r.lang !== 'es' ? ` | ${LANGUAGE_NAME_ES[r.lang]}` : ''}`
