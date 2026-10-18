// Solicitud de cotización: campos, límites, validación y textos. Lo comparten el cotizador
// (navegador) y la función /api/cotizacion (servidor), para que los dos validen y redacten igual.
// Las importaciones llevan .js porque en Vercel la función corre como módulo ES de Node.
import { QUOTE_TYPES, type QuoteType } from '../data/quote-types.js'

export const SITES = ['Planta industrial', 'Oficinas / corporativo', 'CEDIS / almacén', 'Institución educativa', 'Comercio / edificio', 'Otro']

export interface QuoteRequest {
  types: QuoteType[]
  site: string
  location: string
  description: string
  name: string
  company: string
  email: string
  phone: string
  /** Servicio o necesidad desde donde se abrió el cotizador. */
  context?: string
}

export type QuoteField = keyof QuoteRequest
type TextField = Exclude<QuoteField, 'types'>

/** Longitud máxima de cada campo de texto (los campos la respetan y el servidor la vuelve a revisar). */
export const MAX_LENGTH: Record<TextField, number> = { site: 40, location: 160, description: 4000, name: 120, company: 160, email: 254, phone: 25, context: 160 }

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

/** Errores por campo; vacío si la solicitud está completa. */
export function validateQuote(r: QuoteRequest): Partial<Record<QuoteField, string>> {
  const e: Partial<Record<QuoteField, string>> = {}
  // Longitudes primero: un campo excedido se rechaza sin evaluar su formato.
  for (const k of TEXT_FIELDS) if ((r[k]?.length ?? 0) > MAX_LENGTH[k]) e[k] = `Use como máximo ${MAX_LENGTH[k]} caracteres.`
  if (!r.types.length) e.types = 'Seleccione al menos una opción.'
  if (!e.location && r.location.trim().length < 3) e.location = 'Indique la ciudad o zona del proyecto.'
  if (!e.description && r.description.trim().length < 15) e.description = 'Describa la necesidad en al menos una frase (15 caracteres).'
  if (!e.name && r.name.trim().length < 3) e.name = 'Escriba su nombre.'
  if (!e.company && r.company.trim().length < 2) e.company = 'Escriba el nombre de la empresa.'
  if (!e.email && !EMAIL.test(r.email.trim())) e.email = 'Revise el formato del correo, por ejemplo nombre@empresa.com.'
  if (!e.phone) {
    const digits = r.phone.replace(/\D/g, '').length
    if (digits < 10) e.phone = 'Escriba un número de 10 dígitos.'
    else if (digits > 15 || !PHONE.test(r.phone.trim())) e.phone = 'Use sólo números, espacios, guiones o paréntesis (hasta 15 dígitos).'
  }
  return e
}

/** Campos de una línea: saltos, tabuladores y separadores Unicode se vuelven un espacio (no inyectan renglones). */
export const singleLine = (s: string) => s.replace(/[\r\n\t\u2028\u2029]+/g, ' ')

export const typeLabels = (types: QuoteType[]) => types.map((t) => QUOTE_TYPES.find((q) => q.id === t)?.label ?? t)

/** Número para wa.me: los de 10 dígitos se toman como mexicanos (+52). */
export function waNumber(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits.length === 10 ? `52${digits}` : digits
}

/** Ubicación tal como se muestra en los avisos: tipo de inmueble y ciudad. */
export const placeOf = (r: QuoteRequest) => [r.site, r.location.trim()].filter(Boolean).join(' · ')

/**
 * Aviso de la solicitud con el formato que recibe el equipo comercial por WhatsApp. Se usa para el
 * envío manual (botón que abre WhatsApp) y repite los datos de la plantilla del aviso automático.
 */
export function quoteNotice(r: QuoteRequest, opts: { files: string[]; folio?: string; date?: string }): string {
  return [
    '*NUEVA COTIZACIÓN — INTERFAZ REDES*',
    opts.folio || opts.date ? '' : null,
    opts.folio ? `Folio: ${opts.folio}` : null,
    opts.date ? `Fecha: ${opts.date}` : null,
    '',
    `*Cliente:* ${r.name.trim()}`,
    `*Empresa:* ${r.company.trim()}`,
    `*Servicio:* ${typeLabels(r.types).join(', ')}`,
    r.context ? `*Referencia:* ${r.context}` : null,
    `*Ubicación:* ${placeOf(r)}`,
    `*WhatsApp:* ${r.phone.trim()}`,
    `*Correo:* ${r.email.trim()}`,
    '',
    '*Descripción del proyecto:*',
    r.description.trim(),
    opts.files.length ? '' : null,
    opts.files.length ? '*Archivos:*' : null,
    opts.files.length ? (opts.folio ? `${opts.files.join(', ')} (adjuntos al correo de la solicitud)` : `${opts.files.join(', ')} (los comparto en este chat)`) : null,
  ]
    .filter((l) => l !== null)
    .join('\n')
}

export const quoteSubject = (r: QuoteRequest) => `Nueva solicitud de cotización | Interfaz Redes | ${typeLabels(r.types).join(', ') || 'Proyecto'}`

