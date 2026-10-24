import { ArrowRight } from 'lucide-react'
import { useEffect, type CSSProperties } from 'react'
import { SCENES } from '../../data/journey'
import { IMG } from '../../data/media'
import { useI18n } from '../../i18n'
import { Link } from '../../i18n/Link'
import { scrollToId, useHideFloating } from '../../lib/utils'
import { useExperience } from '../../motion/experience'
import { Callout, CoverBox, SplitWords, useReveal } from '../../motion/primitives'
import { CHAPTER_IDS } from './Hero'

/**
 * «De la conexión a la operación»: cuatro capítulos que recorren la infraestructura (cableado, fibra, seguridad e
 * integración) sobre fotografías con anotaciones técnicas.
 *
 * El HTML es el mismo para todos: capítulos uno debajo de otro (teléfono, «reducir movimiento», sin JavaScript).
 * En escritorio con capacidad (nivel full), journey-motion.ts —que se descarga aparte con GSAP— convierte la sección
 * en un escenario fijo con `position: sticky`: cada capítulo entra por una máscara, la cámara avanza sobre la foto,
 * el último capítulo se aleja para mostrar la instalación completa y la red se dibuja sobre ella.
 */
export function Journey() {
  const { t, c } = useI18n()
  const tier = useExperience()
  const root = useReveal<HTMLElement>()
  const stage = tier === 'full'
  // Durante el recorrido no se muestra el botón flotante de WhatsApp (taparía el índice); el header sigue con «Cotizar».
  const track = useHideFloating<HTMLDivElement>()

  useEffect(() => {
    const el = root.current
    if (!el || tier === null) return
    if (!stage) {
      // Capítulos apilados: las anotaciones aparecen cuando la foto se ve.
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-on'); io.unobserve(e.target) }
      }, { threshold: 0.5 })
      el.querySelectorAll('.callouts-js').forEach((n) => io.observe(n))
      return () => io.disconnect()
    }
    let cleanup = () => {}
    let cancelled = false
    el.classList.add('journey-stage')
    import('./journey-motion')
      .then(({ mountJourney }) => { if (!cancelled) cleanup = mountJourney(el) })
      .catch(() => el.classList.remove('journey-stage'))
    return () => { cancelled = true; cleanup(); el.classList.remove('journey-stage') }
  }, [root, stage, tier])

  return (
    <section ref={root} id="recorrido" aria-labelledby="recorrido-title" className="journey relative bg-night text-white">
      <header className="container pb-14 pt-24 md:pb-20 md:pt-32">
        <p data-reveal="rise" className="flex items-center gap-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-lumen">
          <span aria-hidden className="h-px w-8 bg-lumen" />{t.journey.eyebrow}
        </p>
        <h2 id="recorrido-title" data-reveal="words" className="mt-6 max-w-[22ch] text-[clamp(2rem,1.1rem+3vw,4rem)] font-semibold leading-[1.02] tracking-[-0.03em] !text-white">
          <SplitWords text={t.journey.title} mode="view" />
        </h2>
      </header>

      <div ref={track} className="journey-track" style={{ '--n': SCENES.length } as CSSProperties}>
        <div className="journey-sticky">
          {SCENES.map((sc, i) => {
            const ch = t.journey.chapters[i]
            const img = IMG[sc.img]
            return (
              <article key={sc.img} id={CHAPTER_IDS[i]} className="jc" aria-labelledby={`${CHAPTER_IDS[i]}-t`} data-index={i}>
                <div className="jc-scene cover-stage">
                  <CoverBox ratio={sc.ratio} px={sc.px} py={sc.py} className="jc-media">
                    {/* Baja prioridad: no compiten con la foto del hero. En el teléfono, como máximo la versión de 1024 px. */}
                    <img src={img.src} srcSet={img.srcSet} sizes="(min-width: 768px) 100vw, 85vw" alt={img.alt} loading="lazy" decoding="async" {...{ fetchpriority: 'low' }} />
                    {sc.network && (
                      <svg aria-hidden className="jc-net absolute inset-0 h-full w-full" viewBox="0 0 1 1" preserveAspectRatio="none">
                        {sc.network.paths.map((p, k) => (
                          <path key={k} d={`M${p.map(([x, y]) => `${x} ${y}`).join(' L')}`} pathLength={1} className="jc-net-path" />
                        ))}
                      </svg>
                    )}
                    {sc.network?.nodes.map(([x, y], k) => <span key={k} aria-hidden className="jc-node" style={{ left: `${x * 100}%`, top: `${y * 100}%`, '--k': k } as CSSProperties} />)}
                    <div className="callouts-js">
                      {sc.callouts.map((co, k) => <Callout key={k} x={co.x} y={co.y} side={co.side} label={ch.callouts[k]} delay={k * 160} n={k + 1} />)}
                    </div>
                  </CoverBox>
                  <div aria-hidden className="jc-shade" />
                  {img.ref && <p className="img-caption z-[2]">{t.common.referenceImage}</p>}
                </div>
                <ol className="jc-legend container mt-4 grid gap-1.5 text-small text-white/70 md:hidden">
                  {ch.callouts.map((l, k) => (
                    <li key={l} className="flex items-baseline gap-2.5"><span className="font-mono text-[0.7rem] text-lumen">{k + 1}</span>{l}</li>
                  ))}
                </ol>
                <div className="jc-copy-wrap container">
                  <div className="jc-copy">
                    <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-lumen">
                      {t.journey.chapter} {String(i + 1).padStart(2, '0')} <span className="text-white/40">/ {String(SCENES.length).padStart(2, '0')}</span> · {ch.tag}
                    </p>
                    <h3 id={`${CHAPTER_IDS[i]}-t`} className="mt-4 text-[clamp(1.9rem,1.2rem+2.2vw,3.4rem)] font-semibold leading-[1.04] tracking-[-0.028em] !text-white">{ch.title}</h3>
                    <p className="mt-5 max-w-[34rem] text-white/75">{ch.text}</p>
                    <ul className="mt-7 flex flex-wrap gap-2">
                      {sc.services.map((slug) => {
                        const s = c.serviceBySlug(slug)
                        return s && (
                          <li key={slug}>
                            <Link to={`/soluciones/${slug}`} className="inline-flex items-center gap-1.5 rounded-[2px] border border-white/20 px-3 py-1.5 text-[0.85rem] text-white/85 transition-colors hover:border-lumen hover:text-white">
                              {s.name}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              </article>
            )
          })}

          {/* Progreso del recorrido (sólo en el escenario fijo de escritorio). */}
          <nav className="journey-rail" aria-label={t.hero.indexLabel}>
            <span aria-hidden className="journey-rail-line"><span className="journey-rail-fill" /></span>
            <ol className="relative grid gap-7">
              {t.journey.chapters.map((ch, i) => (
                <li key={ch.tag}>
                  <a href={`#${CHAPTER_IDS[i]}`} onClick={(e) => { e.preventDefault(); scrollToId(CHAPTER_IDS[i]) }} data-rail={i} className="journey-rail-item group flex items-center gap-3 text-[0.8rem]">
                    <span className="journey-rail-dot" aria-hidden />
                    <span className="font-mono text-[0.68rem]">{String(i + 1).padStart(2, '0')}</span>
                    <span className="journey-rail-label">{ch.tag}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      <div className="container pb-24 pt-20 md:pb-32 md:pt-28">
        <div className="grid gap-10 border-t border-white/15 pt-12 lg:grid-cols-12 lg:items-end">
          <p data-reveal="words" className="font-display text-[clamp(1.6rem,1.1rem+1.8vw,2.75rem)] font-medium leading-[1.12] tracking-[-0.022em] text-white lg:col-span-8">
            <SplitWords text={t.journey.closing} mode="view" />
          </p>
          <div data-reveal="rise" className="lg:col-span-4 lg:justify-self-end">
            <Link to="/soluciones" className="group inline-flex items-center gap-3 font-medium text-white">
              <span className="link-line">{t.journey.cta}</span>
              <ArrowRight aria-hidden className="arrow-nudge h-5 w-5 text-lumen" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
        <p className="mt-10 text-label text-white/45">{t.journey.note}</p>
      </div>
    </section>
  )
}
