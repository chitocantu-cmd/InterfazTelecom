// Tipos de proyecto del cotizador. Aparte del catálogo (solutions.ts) para que el cotizador y la función del
// servidor no carguen todos los servicios.
export type QuoteType = 'cableado' | 'fibra' | 'cctv' | 'acceso' | 'infra' | 'otro'

export const QUOTE_TYPES: { id: QuoteType; label: string; hint: string }[] = [
  { id: 'cableado', label: 'Cableado y redes', hint: 'Nodos Cat6 / Cat6A, voz y datos' },
  { id: 'fibra', label: 'Fibra óptica', hint: 'Enlaces entre edificios, racks o pisos' },
  { id: 'cctv', label: 'CCTV', hint: 'Cámaras, grabación y monitoreo' },
  { id: 'acceso', label: 'Control de acceso', hint: 'Peatonal, vehicular o asistencia' },
  { id: 'infra', label: 'Infraestructura TI', hint: 'Site, racks, switching, WiFi' },
  { id: 'otro', label: 'Otro proyecto', hint: 'Ingeniería, mantenimiento o integral' },
]
