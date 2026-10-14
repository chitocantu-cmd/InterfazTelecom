// Aviso automático por WhatsApp Business Platform (Cloud API oficial de Meta).
// A números que no le han escrito al negocio en las últimas 24 h sólo se les puede enviar una
// plantilla aprobada; su texto está en el README ("Plantilla de WhatsApp"). Los parámetros siguen
// el mismo orden y contenido que quoteNotice() en src/lib/cotizacion.ts.
import { placeOf, typeLabels } from '../../src/lib/cotizacion.js'
import type { Config } from './config.js'
import type { Delivery, Quote } from './tipos.js'

/** WhatsApp no acepta saltos de línea, tabuladores ni más de 4 espacios seguidos en un parámetro. */
const param = (s: string, max: number) => {
  const clean = s.replace(/[\r\n\t]+/g, ' · ').replace(/ {4,}/g, '   ').trim()
  return (clean.length > max ? `${clean.slice(0, max - 1)}…` : clean) || '—'
}

export function templateParams(q: Quote): string[] {
  const r = q.request
  const files = q.files.length ? `${q.files.length} archivo(s) adjunto(s) en el correo de la solicitud` : 'Sin archivos'
  return [
    param(q.folio, 40),
    param(q.date, 60),
    param(r.name, 120),
    param(r.company, 160),
    param([typeLabels(r.types).join(', '), r.context].filter(Boolean).join(' · '), 200),
    param(placeOf(r), 200),
    param(r.phone, 25),
    param(r.email, 254),
    param(r.description, 500),
    param(files, 100),
  ]
}

/**
 * Envía la plantilla a cada número autorizado. Sólo reintenta si la petición no llegó a Meta
 * (error de red); si Meta respondió, no se repite, para no mandar avisos duplicados.
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
          if (attempt === 2) return `red: ${e instanceof Error ? e.message : String(e)}`
          await new Promise((r) => setTimeout(r, 800))
          continue
        }
        if (res.ok) return null
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
