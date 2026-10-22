import { useId, useState } from 'react'
import { IMG, type ImgKey } from '../../data/media'
import { useT } from '../../i18n'

/**
 * Comparador antes/después de un mismo punto (por ejemplo, un rack antes y después de ordenarlo). Sólo para
 * fotografías reales y autorizadas del proyecto. Se controla con el control deslizante (teclado: flechas, Inicio,
 * Fin) o arrastrando; las dos fotografías también tienen su texto alternativo.
 */
export function BeforeAfter({ before, after, caption }: { before: ImgKey; after: ImgKey; caption: string }) {
  const t = useT()
  const id = useId()
  const [pos, setPos] = useState(50)
  const a = IMG[after]
  const b = IMG[before]
  return (
    <figure>
      <div className="relative aspect-[16/10] select-none overflow-hidden bg-mist focus-within:ring-2 focus-within:ring-lumen focus-within:ring-offset-2">
        <img src={a.src} srcSet={a.srcSet} sizes="(min-width: 1024px) 66vw, 100vw" alt={`${t.project.after}: ${a.alt}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: a.pos }} />
        <img src={b.src} srcSet={b.srcSet} sizes="(min-width: 1024px) 66vw, 100vw" alt={`${t.project.before}: ${b.alt}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: b.pos, clipPath: `inset(0 ${100 - pos}% 0 0)` }} />
        <span aria-hidden className="absolute inset-y-0 w-[2px] bg-white shadow-[0_0_0_1px_rgba(8,29,54,0.25)]" style={{ left: `calc(${pos}% - 1px)` }} />
        <span aria-hidden className="absolute left-3 top-3 bg-navy/80 px-2 py-1 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-white">{t.project.before}</span>
        <span aria-hidden className="absolute right-3 top-3 bg-navy/80 px-2 py-1 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-white">{t.project.after}</span>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={t.project.compareLabel}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="mt-3 text-small text-body">{caption}</figcaption>
    </figure>
  )
}
