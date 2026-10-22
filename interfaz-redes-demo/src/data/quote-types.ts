// Tipos de proyecto del cotizador. Aparte del catálogo (solutions.ts) para que el cotizador y la función del
// servidor no carguen todos los servicios. Las etiquetas en otros idiomas viven aquí (no en los diccionarios) porque
// el servidor también las usa para el acuse en el idioma del cliente.
import type { Locale } from '../i18n/config.js'

export type QuoteType = 'cableado' | 'fibra' | 'cctv' | 'acceso' | 'infra' | 'otro'

export const QUOTE_TYPES: { id: QuoteType; label: string; hint: string }[] = [
  { id: 'cableado', label: 'Cableado y redes', hint: 'Nodos Cat6 / Cat6A, voz y datos' },
  { id: 'fibra', label: 'Fibra óptica', hint: 'Enlaces entre edificios, racks o pisos' },
  { id: 'cctv', label: 'CCTV', hint: 'Cámaras, grabación y monitoreo' },
  { id: 'acceso', label: 'Control de acceso', hint: 'Peatonal, vehicular o asistencia' },
  { id: 'infra', label: 'Infraestructura TI', hint: 'Site, racks, switching, WiFi' },
  { id: 'otro', label: 'Otro proyecto', hint: 'Ingeniería, mantenimiento o integral' },
]

/** Etiqueta y pista de cada tipo en otros idiomas (traducción pendiente de revisión lingüística). */
export const QUOTE_TYPE_TEXT: Record<Exclude<Locale, 'es'>, Record<QuoteType, { label: string; hint: string }>> = {
  en: {
    cableado: { label: 'Cabling and networks', hint: 'Cat6 / Cat6A drops, voice and data' },
    fibra: { label: 'Fiber optics', hint: 'Links between buildings, racks or floors' },
    cctv: { label: 'CCTV', hint: 'Cameras, recording and monitoring' },
    acceso: { label: 'Access control', hint: 'Pedestrian, vehicle or attendance' },
    infra: { label: 'IT infrastructure', hint: 'Telecom room, racks, switching, WiFi' },
    otro: { label: 'Other project', hint: 'Engineering, maintenance or turnkey' },
  },
  ko: {
    cableado: { label: '케이블링 및 네트워크', hint: 'Cat6 / Cat6A 포트, 음성 및 데이터' },
    fibra: { label: '광케이블', hint: '건물·랙·층 간 링크' },
    cctv: { label: 'CCTV', hint: '카메라, 녹화 및 모니터링' },
    acceso: { label: '출입 통제', hint: '보행자·차량 출입 또는 근태' },
    infra: { label: 'IT 인프라', hint: '통신실, 랙, 스위칭, WiFi' },
    otro: { label: '기타 프로젝트', hint: '엔지니어링, 유지보수 또는 통합 프로젝트' },
  },
  'zh-CN': {
    cableado: { label: '综合布线与网络', hint: 'Cat6 / Cat6A 信息点、语音和数据' },
    fibra: { label: '光纤', hint: '建筑、机柜或楼层之间的链路' },
    cctv: { label: '视频监控（CCTV）', hint: '摄像机、录像与监控' },
    acceso: { label: '门禁控制', hint: '人员、车辆出入或考勤' },
    infra: { label: 'IT 基础设施', hint: '机房、机柜、交换、WiFi' },
    otro: { label: '其他项目', hint: '工程设计、维护或整体项目' },
  },
}

export const isQuoteType = (value: unknown): value is QuoteType => QUOTE_TYPES.some((q) => q.id === value)

/** Tipos con su texto en el idioma pedido. */
export const quoteTypesFor = (locale: Locale) =>
  locale === 'es' ? QUOTE_TYPES : QUOTE_TYPES.map((q) => ({ ...q, ...QUOTE_TYPE_TEXT[locale][q.id] }))
