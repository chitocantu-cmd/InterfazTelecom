// Aviso automático por WhatsApp Business Platform (Cloud API oficial de Meta).
// A números que no le han escrito al negocio en las últimas 24 h sólo se les puede enviar una
// plantilla aprobada; su texto está en el README («WhatsApp (WhatsApp Business Platform · Cloud API
// de Meta)»). La plantilla debe tener exactamente las 10 variables {{1}}…{{10}} en el orden de
// templateParams(): folio, fecha, cliente, empresa, servicio, ubicación, WhatsApp, correo, descripción, archivos.
import { placeOf, typeLabels } from '../../src/lib/cotizacion.js'
import type { Config } from './config.js'
import type { Delivery, Quote } from './tipos.js'

/**
 * Largo máximo de cada variable. Meta rechaza el mensaje (error 132005) si el cuerpo ya armado pasa de
 * 1 024 caracteres; el texto fijo de la plantilla mide 236, así que las variables suman como máximo 760.
 */
const LIMITS = { folio: 20, date: 45, name: 60, company: 70, service: 110, place: 90, phone: 20, email: 80, description: 230, files: 35 }

/** WhatsApp no acepta saltos de línea, tabuladores ni más de 4 espacios seguidos en un parámetro. */
const param = (s: string, max: number) => {
  const clean = s.replace(/[\r\n\t]+/g, ' · ').replace(/ {4,}/g, '   ').trim()
  return (clean.length > max ? `${clean.slice(0, max - 1)}…` : clean) || '—'
}

export function templateParams(q: Quote): string[] {
  const r = q.request
  // Texto neutro: el correo y el WhatsApp salen al mismo tiempo, así que aquí no se sabe si el correo llegó.
  const files = q.files.length ? `${q.files.length} archivo(s) adjunto(s)` : 'Sin archivos'
  return [
    param(q.folio, LIMITS.folio),
    param(q.date, LIMITS.date),
    param(r.name, LIMITS.name),
    param(r.company, LIMITS.company),
    param([typeLabels(r.types).join(', '), r.context].filter(Boolean).join(' · '), LIMITS.service),
    param(placeOf(r), LIMITS.place),
    param(r.phone, LIMITS.phone),
    param(r.email, LIMITS.email),
    param(r.description, LIMITS.description),
    param(files, LIMITS.files),
  ]
}

/** La descripción completa no cabe en la plantilla: sólo llega entera por correo. */
export const descriptionTrimmed = (q: Quote) => q.request.description.trim().length > LIMITS.description

/**
 * Envía la plantilla a cada número autorizado. Sólo reintenta si la petición no salió (error de red
 * antes de conectar); si Meta respondió o se agotó el tiempo de espera (pudo haberla recibido), no
 * se repite, para no mandar avisos duplicados.
 */
export async function sendWhatsApp(cfg: Config, q: Quote): Promise<Delivery> {
  const w = cfg.whatsapp
  const url = `https://graph.facebook.com/${w.apiVersion}/${w.phoneNumberId}/messages`
  const parameters = templateParams(q).map((text) => ({ type: 'text', text }))
  const results = await Promise.all(
    w.to.map(async (to) => {
      for (let attempt = 1; attempt <= 2; attempt++) {
        let res: Response
        try {
          res = await fetch(url, {
            method: 'POST',
            headers: { Authorization: `Bearer ${w.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to,
              type: 'template',
              template: { name: w.template, language: { code: w.language }, components: [{ type: 'body', parameters }] },
            }),
            signal: AbortSignal.timeout(8000),
          })
        } catch (e) {
          const name = e instanceof Error ? e.name : ''
          if (attempt === 2 || name === 'TimeoutError') return `${name === 'TimeoutError' ? 'tiempo agotado' : 'red'}: ${e instanceof Error ? e.message : String(e)}`
          await new Promise((r) => setTimeout(r, 800))
          continue
        }
        if (res.ok) {
          await res.body?.cancel()
          return null
        }
        const body = (await res.json().catch(() => ({}))) as { error?: { code?: number; message?: string } }
        return `HTTP ${res.status} ${body.error?.code ?? ''} ${body.error?.message ?? ''}`.trim().slice(0, 200)
      }
      return 'sin respuesta'
    }),
  )
  const failed = results.filter(Boolean) as string[]
  if (!failed.length) return { status: 'enviado' }
  return { status: failed.length < results.length ? 'parcial' : 'error', detail: failed.join(' | ') }
}
