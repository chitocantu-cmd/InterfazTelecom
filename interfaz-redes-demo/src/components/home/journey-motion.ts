import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GSAP_EASE } from '../../motion/tokens'

gsap.registerPlugin(ScrollTrigger)

/**
 * Escenario fijo del recorrido (sólo nivel full, ≥ 1024 px con mouse). Se descarga aparte con GSAP y ScrollTrigger.
 *
 * La pista (.journey-track) mide 85 vh por capítulo + una pantalla; dentro, .journey-sticky queda fijo con
 * `position: sticky` (sin el «pin» de GSAP, que movería nodos que React administra). Una línea de tiempo atada al
 * desplazamiento (scrub) mueve la cámara sobre cada foto y abre el capítulo siguiente con una máscara; los textos,
 * las anotaciones y el índice cambian con clases (transiciones CSS), no cuadro por cuadro.
 *
 * Unidades de la línea de tiempo: capítulo i ocupa [i, i + 1); su cambio al siguiente, [i + 0.7, i + 1).
 * Devuelve la limpieza: revierte estilos, quita ScrollTrigger y deja el HTML como estaba (capítulos apilados).
 */
export function mountJourney(root: HTMLElement): () => void {
  const track = root.querySelector<HTMLElement>('.journey-track')
  const chapters = Array.from(root.querySelectorAll<HTMLElement>('.jc'))
  if (!track || chapters.length === 0) return () => {}
  const n = chapters.length
  const scenes = chapters.map((c) => c.querySelector<HTMLElement>('.jc-scene')!)
  const media = chapters.map((c) => c.querySelector<HTMLElement>('.jc-media')!)
  const callouts = chapters.map((c) => c.querySelector<HTMLElement>('.callouts-js'))
  const nets = Array.from(root.querySelectorAll<SVGPathElement>('.jc-net-path'))
  const railItems = Array.from(root.querySelectorAll<HTMLElement>('[data-rail]'))
  let active = -1
  let on = -1

  const setActive = (t: number) => {
    const next = Math.min(n - 1, Math.max(0, Math.floor(t + 0.15)))
    if (next !== active) {
      active = next
      chapters.forEach((c, i) => c.classList.toggle('is-active', i === next))
      railItems.forEach((r, i) => { r.classList.toggle('is-active', i === next); r.setAttribute('aria-current', i === next ? 'step' : 'false') })
    }
    // Las anotaciones aparecen cuando la cámara ya se asentó (en el último capítulo, al terminar de alejarse).
    const settled = next === n - 1 ? t >= n - 1 + 0.45 : t >= next - 0.05
    const nextOn = settled ? next : -1
    if (nextOn !== on) {
      on = nextOn
      callouts.forEach((c, i) => c?.classList.toggle('is-on', i === nextOn))
    }
  }

  const ctx = gsap.context(() => {
    gsap.set(scenes.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' })
    gsap.set(nets, { strokeDasharray: 1, strokeDashoffset: 1 })

    const tl = gsap.timeline({
      defaults: { ease: GSAP_EASE.scrub },
      scrollTrigger: {
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.7,
        invalidateOnRefresh: true,
        onUpdate: (st) => { root.style.setProperty('--p', st.progress.toFixed(4)); setActive(st.progress * n) },
        onRefresh: (st) => {
          // Destino de los enlaces a cada capítulo (scrollToId lo usa): el inicio de cada capítulo en la pista.
          chapters.forEach((c, i) => { c.dataset.scrollTo = String(Math.round(st.start + ((st.end - st.start) * i) / n + (i ? 2 : 0))) })
        },
      },
    })

    // Capítulo 1: la cámara avanza hacia el rack.
    tl.fromTo(media[0], { scale: 1.16 }, { scale: 1, duration: 0.7 }, 0)
    for (let i = 1; i < n; i++) {
      const t0 = i - 0.3
      const last = i === n - 1
      // El capítulo anterior sigue avanzando mientras el nuevo entra desde abajo por una máscara.
      tl.to(media[i - 1], { scale: '+=0.1', duration: 0.3, ease: GSAP_EASE.inOut }, t0)
      tl.to(scenes[i], { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.3, ease: GSAP_EASE.inOut }, t0)
      // Último capítulo: la cámara se aleja para mostrar la instalación completa.
      // (Cada avance termina justo cuando empieza el cambio siguiente: dos tweens nunca mueven la misma foto.)
      tl.fromTo(media[i], { scale: last ? 1.42 : 1.22 }, { scale: 1, duration: 1 }, t0)
    }
    if (nets.length) tl.to(nets, { strokeDashoffset: 0, duration: 0.55, stagger: 0.12 }, n - 1 + 0.25)
    tl.to({}, { duration: 0.01 }, n)
  }, root)

  setActive(0)
  root.classList.add('journey-ready')
  return () => {
    ctx.revert()
    root.classList.remove('journey-ready')
    root.style.removeProperty('--p')
    chapters.forEach((c) => { c.classList.remove('is-active'); delete c.dataset.scrollTo })
    callouts.forEach((c) => c?.classList.remove('is-on'))
    railItems.forEach((r) => { r.classList.remove('is-active'); r.removeAttribute('aria-current') })
  }
}
