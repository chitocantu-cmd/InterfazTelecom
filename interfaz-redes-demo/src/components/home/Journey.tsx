import { ArrowRight } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { SCENES } from '../../data/journey'
import { IMG } from '../../data/media'
import { useI18n } from '../../i18n'
import { Link } from '../../i18n/Link'
import { scrollToId, useHideFloating, useReducedMotion } from '../../lib/utils'
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
  // Teléfono: los capítulos se deslizan; la barra de abajo indica en cuál se va y lleva a los demás.
  const [chapter, setChapter] = useState(0)
  const reduce = useReducedMotion()
  const rail = () => root.current?.querySelector<HTMLElement>('.journey-sticky') ?? null
  useEffect(() => {
    const el = rail()
    if (!el || !window.matchMedia('(max-width: 767.98px)').matches) return
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setChapter(Number((e.target as HTMLElement).dataset.index))
    }, { root: el, threshold: 0.6 })
    el.querySelectorAll('.jc').forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const goTo = (i: number) => rail()?.querySelectorAll('.jc')[i]?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest', inline: 'start' })

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
      <header className="container pb-9 pt-sec md:pb-20 md:pt-32">
        <p data-reveal="rise" className="flex items-center gap-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-lumen max-md:hidden">
          <span aria-hidden className="h-px w-8 bg-lumen" />{t.journey.eyebrow}
        </p>
        <h2 id="recorrido-title" data-reveal="words" className="max-w-[22ch] text-[clamp(2rem,1.1rem+3vw,4rem)] font-semibold max-md:text-h2 md:mt-6 leading-[1.02] tracking-[-0.03em] !text-white">
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
                </div>
                <ol className="jc-legend container mt-4 grid gap-1.5 text-small text-white/70 md:hidden">
                  {ch.callouts.map((l, k) => (
                    <li key={l} className="flex items-baseline gap-2.5"><span className="font-mono text-[0.7rem] text-lumen">{k + 1}</span>{l}</li>
                  ))}
                </ol>
                <div className="jc-copy-wrap container">
                  <div className="jc-copy">
                    <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-lumen max-md:text-[0.8rem] max-md:normal-case max-md:tracking-normal">
                      <span className="max-md:hidden">{t.journey.chapter} {String(i + 1).padStart(2, '0')} <span className="text-white/40">/ {String(SCENES.length).padStart(2, '0')}</span> · </span>{ch.tag}
                    </p>
                    <h3 id={`${CHAPTER_IDS[i]}-t`} className="mt-2 text-[clamp(1.9rem,1.2rem+2.2vw,3.4rem)] font-semibold leading-[1.04] tracking-[-0.028em] !text-white max-md:text-[1.6rem] max-md:leading-[1.1] md:mt-4">{ch.title}</h3>
                    <p className="mt-3 max-w-[34rem] text-white/75 max-md:text-[1rem] max-md:leading-relaxed md:mt-5">{ch.text}</p>
                    {/* Teléfono: los dos servicios principales del capítulo; el resto está en el menú. */}
                    <ul className="mt-5 flex flex-wrap gap-2 max-md:[&>li:nth-child(n+3)]:hidden md:mt-7">
                      {sc.services.map((slug) => {
                        const s = c.serviceBySlug(slug)
                        return s && (
                          <li key={slug}>
                            <Link to={`/soluciones/${slug}`} className="inline-flex items-center gap-1.5 rounded-[2px] border border-white/20 px-3 py-1.5 text-[0.85rem] text-white/85 transition-colors hover:border-lumen hover:text-white max-md:min-h-[44px]">
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

      {/* Avance por capítulos (teléfono). */}
      <nav aria-label={t.hero.indexLabel} className="jc-dots md:hidden">
        {t.journey.chapters.map((ch, i) => (
          <button key={ch.tag} type="button" aria-label={ch.tag} aria-current={i === chapter ? 'true' : undefined} onClick={() => goTo(i)} />
        ))}
      </nav>

      <div className="container pb-sec pt-9 md:pb-32 md:pt-28">
        <div className="grid gap-6 border-t border-white/15 pt-8 md:gap-10 md:pt-12 lg:grid-cols-12 lg:items-end">
          <p data-reveal="words" className="font-display text-[clamp(1.6rem,1.1rem+1.8vw,2.75rem)] font-medium leading-[1.12] tracking-[-0.022em] text-white lg:col-span-8">
            <SplitWords text={t.journey.closing} mode="view" />
          </p>
          <div data-reveal="rise" className="lg:col-span-4 lg:justify-self-end">
            <Link to="/soluciones" className="group inline-flex items-center gap-3 font-medium text-white max-md:min-h-[44px]">
              <span className="link-line">{t.journey.cta}</span>
              <ArrowRight aria-hidden className="arrow-nudge h-5 w-5 text-lumen" strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
