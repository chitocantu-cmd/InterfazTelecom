import { ArrowRight, Cctv, DoorClosed, Wifi } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useI18n } from '../../i18n'
import { Link } from '../../i18n/Link'
import { cn, useInView } from '../../lib/utils'
import { SectionHead, Tag } from '../ui'

const ENDPOINT_ICON = [Wifi, Cctv, DoorClosed]

/**
 * Esquema conceptual de una instalación empresarial, de la acometida al último dispositivo:
 * SITE → switching → fibra (backbone) → acceso PoE → access points, CCTV y control de acceso.
 * Un pulso recorre cada enlace sólo mientras el diagrama está en pantalla (y nunca con «reducir movimiento»).
 * No simula una red real: es la secuencia lógica con la que se diseña una instalación.
 */
export function FlowDiagram() {
  const { t } = useI18n()
  const [ref, live] = useInView<HTMLOListElement>('-10% 0px')
  const stages = t.flow.stages
  return (
    <section className="border-t border-line py-24 md:py-32" aria-labelledby="flujo-title">
      <div className="container">
        <SectionHead id="flujo-title" title={t.flow.title} lede={t.flow.lede} />
        <ol ref={ref} className={cn('mt-16 grid lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.2fr)]', live && 'flow-live')}>
          {stages.map((s, i) => (
            <li key={s.tag} className="relative pb-12 pl-9 lg:pb-0 lg:pl-0 lg:pr-8">
              <span aria-hidden className={cn('absolute left-0 top-1 h-3 w-3 rounded-full border-2 bg-white lg:top-0', s.service === 'fibra-optica' ? 'border-lumen' : 'border-corp')} />
              <span aria-hidden className="flow-seg"><span className="flow-packet" style={{ '--d': `${i * 650}ms` } as CSSProperties} /></span>
              <div className="lg:pt-9">
                <Tag className={s.service === 'fibra-optica' ? '!text-tech' : undefined}>{s.tag}</Tag>
                <h3 className="mt-2 text-h4">{s.title}</h3>
                <p className="mt-2 max-w-[22rem] text-small text-body">{s.text}</p>
                <Link to={`/soluciones/${s.service}`} className="group mt-4 inline-flex items-center gap-1.5 text-small font-medium text-corp">
                  <span className="link-line">{t.common.learnMore}</span><ArrowRight aria-hidden className="arrow-nudge h-3.5 w-3.5" strokeWidth={1.75} />
                </Link>
              </div>
            </li>
          ))}
          <li className="relative pl-9 lg:pl-0">
            <span aria-hidden className="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-corp bg-corp lg:top-0" />
            <div className="lg:pt-9">
              <Tag>{t.flow.endpointsTag}</Tag>
              <h3 className="mt-2 text-h4">{t.flow.endpointsTitle}</h3>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {t.flow.endpoints.map((e, i) => {
                  const Icon = ENDPOINT_ICON[i] ?? Wifi
                  return (
                    <li key={e.service}>
                      <Link to={`/soluciones/${e.service}`} className="group flex items-center gap-3 py-3 text-small text-ink transition-colors hover:text-corp">
                        <Icon aria-hidden className="h-4 w-4 shrink-0 text-corp" strokeWidth={1.6} />
                        <span className="flex-1">{e.label}</span>
                        <ArrowRight aria-hidden className="arrow-nudge h-3.5 w-3.5 text-faint group-hover:text-corp" strokeWidth={1.75} />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </li>
        </ol>
        <p className="mt-10 font-mono text-[0.72rem] text-muted">{t.flow.note}</p>
      </div>
    </section>
  )
}
