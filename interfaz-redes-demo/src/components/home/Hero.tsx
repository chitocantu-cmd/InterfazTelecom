import type { CSSProperties } from 'react'
import { IMG } from '../../data/media'
import { useI18n } from '../../i18n'
import { Link } from '../../i18n/Link'
import { scrollToId } from '../../lib/utils'
import { Button } from '../ui'

/** Imagen de la portada: es lo más grande de la primera pantalla (marca el LCP) y prerender.mjs la precarga con
 *  prioridad alta. En el teléfono (mobileSrcSet), como máximo la versión de 1024 px: con pantallas de densidad
 *  2.6–3× el navegador pediría la original, casi el doble de peso, para una foto que ahí ocupa unos 400 px. */
export const HERO_IMAGE = {
  src: IMG.aisle.src,
  srcSet: IMG.aisle.srcSet,
  sizes: '(min-width: 1024px) 50vw, 100vw',
  mobileSrcSet: IMG.aisle.srcSet?.split(', ').filter((c) => parseInt(c.split(' ')[1]) <= 1024).join(', '),
  mobileMedia: '(max-width: 1023.98px)',
}

/** Retardo de la coreografía de entrada (index.css: .enter-rise / .enter-reveal). */
const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

/**
 * Portada: quién es Interfaz, qué hace, para qué tipo de proyectos y cómo cotizar, en la primera pantalla.
 * Composición: texto a la izquierda, fotografía a sangre a la derecha con una fotografía real del equipo encima,
 * y abajo el índice de los cinco frentes técnicos. La entrada está coreografiada en CSS (corre con el HTML
 * prerenderizado, antes que el JavaScript) y no bloquea nada: todo es clicable desde el primer momento.
 */
export function Hero() {
  const { t, c } = useI18n()
  const field = IMG.site
  return (
    <section aria-labelledby="hero-title" className="relative mx-auto max-w-frame overflow-hidden bg-white">
      <div className="relative lg:min-h-[min(700px,calc(100svh-var(--hdr)-6.5rem))]">
        <div className="container relative">
          <div className="flex flex-col pb-10 pt-8 sm:pb-12 sm:pt-12 lg:min-h-[min(700px,calc(100svh-var(--hdr)-6.5rem))] lg:w-[47%] lg:justify-center lg:py-12">
            <p className="enter-rise flex items-start gap-3 text-small font-medium text-corp" style={d(40)}>
              <span aria-hidden className="mt-[0.72em] h-px w-8 shrink-0 bg-corp" />
              {t.hero.eyebrow}
            </p>
            <h1 id="hero-title" className="hero-title enter-rise mt-5 max-w-[15ch] text-display !font-semibold lg:max-w-[11.5ch] lg:!text-[clamp(3.1rem,1.2rem+3.2vw,4.6rem)]" style={d(110)}>
              {t.hero.title}
            </h1>
            <p className="enter-rise mt-6 max-w-[33rem] text-lead text-body" style={d(260)}>{t.hero.lede}</p>
            <div className="enter-rise mt-8 flex flex-wrap gap-3" style={d(480)}>
              <Button to="/contacto" track="hero" arrow>{t.hero.primary}</Button>
              <Button onClick={() => scrollToId('soluciones')} variant="secondary">{t.hero.secondary}</Button>
            </div>
            <p className="enter-rise mt-6 text-small text-muted" style={d(600)}>
              {t.hero.helper}{' '}
              <Link to="/explorador" className="font-medium text-corp link-line">{t.hero.helperLink}</Link>
            </p>
          </div>
        </div>

        {/* Fotografía: en escritorio, a sangre a la derecha; en el teléfono, debajo del texto. Va después del texto en el
            HTML para que el lector de pantalla empiece por el título. */}
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-1/2">
          <div className="absolute inset-0 overflow-hidden">
            <picture>
              {HERO_IMAGE.mobileSrcSet && <source media={HERO_IMAGE.mobileMedia} srcSet={HERO_IMAGE.mobileSrcSet} sizes="100vw" />}
              <img src={HERO_IMAGE.src} srcSet={HERO_IMAGE.srcSet} sizes={HERO_IMAGE.sizes} alt={IMG.aisle.alt} className="enter-reveal absolute inset-0 h-full w-full object-cover" style={{ ...d(180), objectPosition: '66% 50%' }} />
            </picture>
          </div>
          {IMG.aisle.ref && <p className="img-caption !bottom-auto top-4">{t.common.referenceImage}</p>}
          <figure className="enter-rise absolute bottom-4 left-4 w-[34%] border-[5px] border-white bg-white shadow-[0_18px_40px_-20px_rgba(8,29,54,0.55)] sm:w-[24%] lg:bottom-10 lg:left-10 lg:w-[27%] xl:w-[24%]" style={d(760)}>
            <div className="aspect-[4/5] overflow-hidden">
              <img src={field.src} srcSet={field.srcSet} sizes="(min-width: 1024px) 15vw, 34vw" alt={field.alt} className="h-full w-full object-cover" style={{ objectPosition: field.pos }} />
            </div>
            <figcaption className="px-1 pb-0.5 pt-2 text-[0.72rem] leading-tight text-muted">{t.hero.fieldCaption}</figcaption>
          </figure>
        </div>
      </div>

      {/* Índice de frentes técnicos: qué hace Interfaz, de un vistazo, y el acceso directo a cada uno. */}
      <nav aria-label={t.hero.indexLabel} className="enter-rise container relative" style={d(680)}>
        <ol className="-mx-[var(--gutter)] flex snap-x snap-mandatory overflow-x-auto border-t border-line px-[var(--gutter)] [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
          {c.categories.map((cat, i) => (
            <li key={cat.id} className="min-w-[13.5rem] shrink-0 snap-start border-l border-line first:border-l-0 lg:min-w-0">
              <Link to={`/soluciones#${cat.id}`} className="group block h-full px-5 py-5 first:pl-0 lg:px-6 lg:py-6">
                <span className="mono-tag text-muted">{String(i + 1).padStart(2, '0')}</span>
                <span className="mt-1.5 block font-display text-[1.02rem] font-semibold leading-snug text-ink transition-colors group-hover:text-corp">{cat.name}</span>
                <span className="mt-1 hidden text-[0.85rem] leading-snug text-muted lg:block">{cat.lede}</span>
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </section>
  )
}
