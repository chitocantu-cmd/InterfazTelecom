import { useRef, type CSSProperties } from 'react'
import { IMG } from '../../data/media'
import { useI18n } from '../../i18n'
import { Link } from '../../i18n/Link'
import { scrollToId } from '../../lib/utils'
import { useExperience } from '../../motion/experience'
import { Callout, CoverBox, SplitWords, useCursorParallax, useMagnetic } from '../../motion/primitives'
import { Button } from '../ui'

/**
 * Imagen del hero: es lo más grande de la primera pantalla (marca el LCP) y prerender.mjs precarga cada fuente con
 * prioridad alta, con el mismo media/srcset/sizes que usa <picture> (así el navegador elige el mismo archivo).
 * En el teléfono va un recorte vertical de la misma foto: a pantalla completa, la horizontal se vería estirada.
 */
export const HERO_IMAGE = {
  src: IMG.aisle.src,
  sources: [
    { media: '(max-width: 767.98px)', srcSet: IMG.aisleTall.srcSet ?? IMG.aisleTall.src, sizes: '120vw' },
    { media: '(min-width: 768px)', srcSet: IMG.aisle.srcSet ?? IMG.aisle.src, sizes: '(min-width: 1024px) 100vw, 150vw' },
  ],
}

/** Capítulos del recorrido (Journey): el índice del hero lleva a cada uno. */
export const CHAPTER_IDS = ['capitulo-1', 'capitulo-2', 'capitulo-3', 'capitulo-4'] as const

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

/**
 * Hero cinematográfico. Coreografía (todo en CSS, corre con el HTML prerenderizado y nunca bloquea):
 * 1. identidad: el header y el logotipo entran primero (Header, .enter-header);
 * 2. entorno: la escena se abre como una compuerta y la cámara se asienta (.hero3-scene, .hero3-zoom);
 * 3. titular: palabra por palabra desde detrás de una máscara (SplitWords);
 * 4. interactividad: con mouse, la foto y el texto responden al cursor con profundidades distintas;
 * 5. descubrimiento: el índice de capítulos y la señal de desplazamiento invitan a seguir.
 * Botones y textos son clicables desde el primer cuadro; la animación sólo los presenta.
 */
export function Hero() {
  const { t } = useI18n()
  const tier = useExperience()
  const ref = useRef<HTMLElement>(null)
  useCursorParallax(ref, tier === 'full')
  const magnetic = useMagnetic<HTMLSpanElement>()
  const [mobile, desktop] = HERO_IMAGE.sources

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-night text-white">
      <div className="relative mx-auto max-w-frame">
        <div className="relative min-h-[calc(100svh-var(--hdr))] md:min-h-[min(880px,calc(100svh-var(--hdr)))]">
          {/* Escena */}
          <div className="hero3-scene absolute inset-0">
            <div className="hero3-depth cover-stage absolute -inset-6">
              <CoverBox className="hero3-box hero3-zoom">
                <picture>
                  <source media={mobile.media} srcSet={mobile.srcSet} sizes={mobile.sizes} />
                  <img src={HERO_IMAGE.src} srcSet={desktop.srcSet} sizes={desktop.sizes} alt={IMG.aisle.alt} className="object-cover" />
                </picture>
                <div className="callouts-load hidden lg:block">
                  <Callout x={0.5} y={0.155} label={t.hero.callouts.duct} delay={1500} />
                  <Callout x={0.84} y={0.34} label={t.hero.callouts.rack} side="left" delay={1750} />
                  <Callout x={0.885} y={0.6} label={t.hero.callouts.cabling} side="left" delay={2000} />
                </div>
              </CoverBox>
            </div>
            <div aria-hidden className="hero3-sweep pointer-events-none absolute inset-0" />
          </div>
          {/* Sombra para leer el texto sobre la foto, sin oscurecer la escena completa. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(5_13_24/0.45)_0%,rgb(5_13_24/0.72)_32%,rgb(5_13_24/0.94)_68%)] md:bg-[linear-gradient(90deg,rgb(5_13_24/0.94)_0%,rgb(5_13_24/0.78)_34%,rgb(5_13_24/0.12)_68%,transparent_100%),linear-gradient(0deg,rgb(5_13_24/0.85)_0%,transparent_32%)]" />

          {/* Texto */}
          <div className="hero3-fore container relative z-10 flex min-h-[inherit] flex-col justify-end pb-16 pt-12 md:justify-center md:pb-28 md:pt-10">
            <p className="enter-rise flex items-start gap-3 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-lumen" style={d(200)}>
              <span aria-hidden className="mt-[0.55em] h-px w-8 shrink-0 bg-lumen" />
              {t.hero.eyebrow}
            </p>
            <h1 id="hero-title" className="hero-title mt-5 max-w-[17ch] text-mega !font-semibold !text-white lg:max-w-[50rem]">
              <SplitWords text={t.hero.title} delay={280} />
            </h1>
            <p className="enter-rise mt-6 max-w-[34rem] text-lead text-white/75" style={d(620)}>{t.hero.lede}</p>
            <div className="enter-rise mt-8 flex flex-wrap gap-3" style={d(720)}>
              <span ref={magnetic} className="inline-block">
                <Button to="/contacto" track="hero" arrow variant="light">{t.hero.primary}</Button>
              </span>
              <Button onClick={() => scrollToId('soluciones')} variant="outlineLight">{t.hero.secondary}</Button>
            </div>
            <p className="enter-rise mt-5 text-small text-white/65" style={d(820)}>
              {t.hero.helper}{' '}
              <Link to="/explorador" className="font-medium text-white link-line">{t.hero.helperLink}</Link>
            </p>
          </div>

          {/* Índice de capítulos y señal de desplazamiento */}
          <nav aria-label={t.hero.indexLabel} className="enter-rise absolute inset-x-0 bottom-0 z-10 hidden md:block" style={d(1150)}>
            <div className="container flex items-end justify-between gap-8 border-t border-white/15 py-5">
              <ol className="flex gap-x-10 gap-y-2">
                {t.journey.chapters.map((ch, i) => (
                  <li key={ch.tag}>
                    <a href={`#${CHAPTER_IDS[i]}`} onClick={(e) => { e.preventDefault(); scrollToId(CHAPTER_IDS[i]) }} className="group flex items-baseline gap-2.5 text-small text-white/65 transition-colors hover:text-white">
                      <span className="font-mono text-[0.7rem] text-lumen">{String(i + 1).padStart(2, '0')}</span>
                      <span className="link-line">{ch.tag}</span>
                    </a>
                  </li>
                ))}
              </ol>
              <span className="hidden shrink-0 items-center gap-4 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-white/55 lg:flex">
                {t.hero.cue}
                <span aria-hidden className="scroll-cue" />
              </span>
            </div>
          </nav>
          {IMG.aisle.ref && <p className="img-caption !bottom-auto top-4 z-10">{t.common.referenceImage}</p>}
        </div>
      </div>
    </section>
  )
}
