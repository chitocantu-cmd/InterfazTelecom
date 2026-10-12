// Datos corporativos. Sólo información verificable en interfazredes.com,
// interfaz.com.mx (división Redes & TI) o el brief del proyecto.
export const COMPANY = {
  name: 'Interfaz Redes y Telecomunicaciones',
  shortName: 'Interfaz Redes',
  whatsappDisplay: '81 3402 1700',
  whatsappIntl: '528134021700',
  phones: ['(81) 3402 1700', '(81) 1133 9500'],
  email: 'ventas@interfaz.com.mx',
  emailProjects: 'proyectos@interfazredes.com',
  site: 'https://interfazredes.com/',
  address: 'Av. 8 Norte #1750, Col. Industrial, Monterrey, N.L.',
  hours: 'Lunes a viernes, 8:00 a 18:00 h',
  years: '+15',
  facebook: 'https://www.facebook.com/interfazredes',
} as const

// Fotografía real de proyectos publicada por Interfaz (interfaz.com.mx).
// En la vista previa del demo los dominios externos están bloqueados, así que
// cada espacio muestra una lámina técnica; al publicar en el dominio de
// Interfaz las fotos cargan sobre la lámina automáticamente.
const P = 'https://www.interfaz.com.mx/assets/fotos/'
export const PHOTOS = {
  rack02: P + 'proyectos/proyecto-redes-rack-02.webp',
  rack03: P + 'proyectos/proyecto-redes-rack-03.webp',
  rack04: P + 'proyectos/proyecto-redes-rack-04.webp',
  plafon: P + 'proyectos/cableado-plafon-instalacion-10.webp',
  pasillo: P + 'proyectos/cableado-tendido-pasillo-11.webp',
  datacenter: P + 'proyectos/proyecto-redes-datacenter-01.webp',
  site: P + 'proyectos/redes-site-tecnicos-12.webp',
  oficina: P + 'proyectos/redes-instalacion-oficina-08.webp',
  redes07: P + 'proyectos/proyecto-redes-interfaz-07.webp',
  cctvHero: P + 'proyectos/hero-cctv-monitoreo.webp',
  cctvIndustria: P + 'proyectos/cctv-industria.webp',
  cctvCorporativo: P + 'proyectos/cctv-corporativo.webp',
  cctvDistribucion: P + 'proyectos/cctv-distribucion.webp',
  cctvComercio: P + 'proyectos/cctv-comercio.webp',
  cableado: P + 'cableado-estructurado-monterrey.webp',
} as const

// Marcas mencionadas en interfaz.com.mx como "marcas que manejamos".
// Se presentan sin implicar alianza, certificación ni distribución oficial.
export const BRANDS_NETWORK = ['Panduit', 'CommScope', 'Cisco', 'Ubiquiti', 'Aruba', 'APC', 'Tripp Lite']
export const BRANDS_SECURITY = ['Hikvision', 'Hanwha Vision', 'Dahua', 'EZVIZ']
