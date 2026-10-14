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
  /** Fecha y hora de Monterrey, legible. */
  date: string
  request: QuoteRequest
  files: QuoteFile[]
}

/**
 * Estado de cada canal:
 * enviado · parcial (WhatsApp: llegó a parte de los números) · error · no_configurado · omitido · prueba (modo local).
 */
export type Status = 'enviado' | 'parcial' | 'error' | 'no_configurado' | 'omitido' | 'prueba'

export interface Delivery {
  status: Status
  id?: string
  detail?: string
}
