import type { QuoteRequest } from '../../src/lib/cotizacion.js'

export interface QuoteFile {
  name: string
  size: number
  /** Contenido en base64 para adjuntarlo al correo. */
  content: string
}

/** Solicitud ya validada, con folio y fecha asignados por el servidor. */
export interface Quote {
  folio: string
  /** Fecha y hora de Monterrey, legible (en español: la lee el equipo comercial). */
  date: string
  /** La misma fecha en el idioma del cliente (confirmación en pantalla y acuse). */
  localDate: string
  request: QuoteRequest
  files: QuoteFile[]
}

/**
 * Estado de cada canal:
 * enviado · parcial (llegó a parte de los correos o números de ventas) · error · no_configurado · omitido · prueba (modo local).
 */
export type Status = 'enviado' | 'parcial' | 'error' | 'no_configurado' | 'omitido' | 'prueba'

export interface Delivery {
  status: Status
  id?: string
  detail?: string
}
