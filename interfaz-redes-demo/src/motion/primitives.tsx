import { Fragment, useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { cn } from '../lib/utils'
import { detectTier } from './experience'

/**
 * Titular que entra palabra por palabra, cada una desde detrás de una máscara (index.css: .split-w / .split-i).
 * Divide sólo por espacios: el coreano conserva sus palabras completas y el chino (sin espacios) entra como un solo
 * bloque, nunca carácter por carácter. El texto queda en el HTML tal cual para buscadores y lectores de pantalla.
 *
 * mode="load"  → corre al cargar la página (CSS, antes del JavaScript): el hero.
 * mode="view"  → corre al entrar en pantalla (useReveal en un contenedor superior marca .is-in).
 */
export function SplitWords({ text, delay = 0, mode = 'load' }: { text: string; delay?: number; mode?: 'load' | 'view' }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="split-w">
            <span className={mode === 'load' ? 'split-i' : 'split-v'} style={{ '--i': i, '--d0': `${delay}ms` } as CSSProperties}>{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  )
}

/**
 * Entradas al desplazarse sin esconder nada en el HTML: al hidratar, sólo se «arman» (se ocultan para entrar después)
 * los elementos [data-reveal] que todavía están debajo de la pantalla; al verse, reciben .is-in. Con «reducir
 * movimiento» no se arma nada y todo queda en su lugar.
 */
export function useReveal<T extends HTMLElement>(): RefObject<T> {
  const ref = useRef<T>(null)
  useEffect(() => {
    const root = ref.current
    if (!root || typeof IntersectionObserver === 'undefined' || detectTier() === 'reduced') return
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    const below = items.filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.92)
    below.forEach((el) => el.classList.add('reveal-armed'))
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) }
    }, { rootMargin: '0px 0px -12% 0px' })
    below.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return ref
}

/**
 * Caja con la proporción de la imagen que cubre a su contenedor (.cover-stage) igual que object-fit: cover, con el
 * encuadre en (px, py). Lo que va dentro —la imagen y sus anotaciones en coordenadas de la foto— se recorta y se
 * escala junto: una anotación en (0.62, 0.66) siempre señala el mismo punto de la foto, en cualquier pantalla.
 */
export function CoverBox({ ratio, px, py, className, style, children, innerRef }: {
  /** Proporción ancho/alto de la foto. Si cambia por tamaño de pantalla, se omite y la clase define --r. */
  ratio?: number; px?: number; py?: number; className?: string; style?: CSSProperties; children: ReactNode; innerRef?: RefObject<HTMLDivElement>
}) {
  const vars = { ...(ratio !== undefined && { '--r': ratio }), ...(px !== undefined && { '--px': px }), ...(py !== undefined && { '--py': py }) }
  return (
    <div ref={innerRef} className={cn('cover-box', className)} style={{ ...vars, ...style } as CSSProperties}>
      {children}
    </div>
  )
}

/**
 * Anotación técnica sobre una fotografía: un punto en (x, y) —fracciones de la foto— y una línea hacia su etiqueta.
 * `side` indica hacia dónde sale la etiqueta. Entra con un retardo (delay, ms) cuando su contenedor tiene .is-on.
 */
export function Callout({ x, y, label, side = 'right', delay = 0, n, className }: {
  x: number; y: number; label: string; side?: 'left' | 'right'; delay?: number
  /** Número que reemplaza a la etiqueta en pantallas angostas (la leyenda va debajo de la foto). */
  n?: number
  className?: string
}) {
  return (
    <span className={cn('callout', side === 'left' && 'callout-left', className)} style={{ left: `${x * 100}%`, top: `${y * 100}%`, '--cd': `${delay}ms` } as CSSProperties} aria-hidden>
      <span className="callout-dot" />
      {n !== undefined && <span className="callout-num">{n}</span>}
      <span className="callout-line" />
      <span className="callout-label">{label}</span>
    </span>
  )
}

/**
 * Parallax con el cursor: escribe --mx y --my (de -1 a 1) en el elemento, una vez por cuadro, sin renders de React.
 * Las capas lo usan en CSS (.parallax-*) y una transición suaviza el movimiento. Sólo con mouse y nivel «full».
 */
export function useCursorParallax<T extends HTMLElement>(ref: RefObject<T>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    let raf = 0
    let nx = 0
    let ny = 0
    const apply = () => { raf = 0; el.style.setProperty('--mx', nx.toFixed(3)); el.style.setProperty('--my', ny.toFixed(3)) }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const r = el.getBoundingClientRect()
      nx = ((e.clientX - r.left) / r.width) * 2 - 1
      ny = ((e.clientY - r.top) / r.height) * 2 - 1
      raf ||= requestAnimationFrame(apply)
    }
    const leave = () => { nx = 0; ny = 0; raf ||= requestAnimationFrame(apply) }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      cancelAnimationFrame(raf)
      el.style.removeProperty('--mx')
      el.style.removeProperty('--my')
    }
  }, [ref, enabled])
}

/**
 * Botón magnético: con mouse, el botón se inclina unos píxeles hacia el cursor y vuelve al salir. No cambia el área
 * de clic ni el cursor del sistema. Se aplica a los CTA principales, no a formularios.
 */
export function useMagnetic<T extends HTMLElement>(strength = 8): RefObject<T> {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || detectTier() !== 'full') return
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const r = el.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
      el.style.transform = `translate3d(${(dx * strength).toFixed(1)}px, ${(dy * strength * 0.6).toFixed(1)}px, 0)`
    }
    const leave = () => { el.style.transform = '' }
    el.classList.add('magnetic')
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      el.classList.remove('magnetic')
      el.style.transform = ''
    }
  }, [strength])
  return ref
}
