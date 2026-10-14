// Configuración de la recepción de cotizaciones. Todo sale de variables de entorno del servidor
// (en Vercel: Settings → Environment Variables; en local: .env.local). Ver .env.example y el README.
import { COMPANY } from '../../src/data/company.js'

const env = (key: string) => process.env[key]?.trim() ?? ''
const list = (value: string) => value.split(/[,;\s]+/).map((v) => v.trim()).filter(Boolean)

export interface Config {
  /** Dirección pública del sitio (enlaces y logotipo en los correos). */
  site: string
  email: {
    apiKey: string
    from: string
    /** Bandeja(s) de ventas que reciben cada solicitud. */
    to: string[]
    /** Reply-To del acuse al cliente: a dónde llega si el cliente contesta. */
    replyTo: string
    /** Enviar acuse de recibo al cliente. */
    ack: boolean
  }
  whatsapp: {
    token: string
    phoneNumberId: string
    /** Números autorizados que reciben el aviso, en formato internacional sin "+" (5218112345678). */
    to: string[]
    template: string
    language: string
    apiVersion: string
  }
  /** Solicitudes por IP en 10 minutos. */
  rateLimit: number
  /** Modo de prueba local: escribe los mensajes en esta carpeta en lugar de enviarlos. Nunca en Vercel. */
  testDir: string | null
}

export function getConfig(): Config {
  return {
    site: COMPANY.site.replace(/\/$/, ''),
    email: {
      apiKey: env('RESEND_API_KEY'),
      from: env('COTIZACION_REMITENTE') || 'Interfaz Redes <cotizaciones@interfaztelecom.com.mx>',
      to: list(env('COTIZACION_DESTINATARIOS') || COMPANY.email),
      replyTo: env('COTIZACION_RESPONDER_A') || COMPANY.email,
      ack: env('COTIZACION_ACUSE') !== '0',
    },
    whatsapp: {
      token: env('WHATSAPP_TOKEN'),
      phoneNumberId: env('WHATSAPP_PHONE_NUMBER_ID'),
      to: list(env('WHATSAPP_DESTINATARIOS')).map((n) => n.replace(/\D/g, '')).filter(Boolean),
      template: env('WHATSAPP_PLANTILLA') || 'nueva_cotizacion',
      language: env('WHATSAPP_PLANTILLA_IDIOMA') || 'es_MX',
      apiVersion: env('WHATSAPP_API_VERSION') || 'v23.0',
    },
    rateLimit: Number(env('COTIZACION_LIMITE_POR_IP')) || 5,
    testDir: env('COTIZACION_PRUEBA') === '1' && !process.env.VERCEL ? '.cotizaciones-prueba' : null,
  }
}

export const emailReady = (c: Config) => Boolean(c.email.apiKey && c.email.to.length)
export const whatsappReady = (c: Config) => Boolean(c.whatsapp.token && c.whatsapp.phoneNumberId && c.whatsapp.to.length)
/** La recepción automática está activa si hay al menos un canal hacia ventas (o en modo de prueba). */
export const receptionReady = (c: Config) => Boolean(c.testDir) || emailReady(c) || whatsappReady(c)
