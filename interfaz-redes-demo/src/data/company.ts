// Datos corporativos. Sólo información verificable en interfazredes.com,
// interfaz.com.mx (división Redes & TI) o el brief del proyecto.
export const COMPANY = {
  name: 'Interfaz Redes y Telecomunicaciones',
  shortName: 'Interfaz Redes',
  // Contacto principal: el que se muestra primero en todo el sitio, el de todos los botones de WhatsApp y el de los
  // enlaces de correo y teléfono.
  whatsappDisplay: '81 8087 1700',
  whatsappIntl: '528180871700',
  phoneIntl: '+528180871700',
  email: 'ffacundo@interfaz.com.mx',
  /** Contacto adicional: se muestra debajo del principal (footer, Contacto y acuse de la cotización). */
  phoneAlt: { display: '81 3402 1700', intl: '+528134021700' },
  emailAlt: 'ventas@interfaz.com.mx',
  phones: ['(81) 8087 1700', '(81) 3402 1700', '(81) 1133 9500'],
  emailProjects: 'proyectos@interfazredes.com',
  site: 'https://interfaztelecom.com.mx/',
  address: 'Av. 8 Norte #1750, Col. Industrial, Monterrey, N.L.',
  /** La misma dirección por partes, para los datos estructurados (schema.org). */
  addressParts: { street: 'Av. 8 Norte #1750, Col. Industrial', city: 'Monterrey', region: 'Nuevo León', country: 'MX' },
  hours: 'Lunes a viernes, 8:00 a 18:00 h',
  /** El mismo horario en el formato de schema.org. */
  hoursSchema: 'Mo-Fr 08:00-18:00',
  areaServed: 'Monterrey y área metropolitana, Nuevo León',
  years: '+15',
  facebook: 'https://www.facebook.com/interfazredes',
} as const

// Marcas mencionadas en interfaz.com.mx como "marcas que manejamos" (páginas de cableado, fibra, WiFi, CCTV y
// control de acceso). Se presentan sin implicar alianza, certificación ni distribución oficial.
export const BRANDS_NETWORK = ['Panduit', 'CommScope', 'Corning', 'Cisco', 'Ubiquiti', 'Aruba', 'TP-Link Omada', 'APC', 'Tripp Lite']
export const BRANDS_SECURITY = ['Hikvision', 'Hanwha Vision', 'Dahua', 'EZVIZ', 'ZKTeco', 'Suprema']
