import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { IMG, type ImgKey } from '../../data/media'
import { useT } from '../../i18n'
import { cn } from '../../lib/utils'

/**
 * Galería de fotografías reales de un proyecto autorizado: mosaico editorial y visor a pantalla completa
 * (<dialog> nativo: atrapa el foco, Escape cierra y el foco vuelve a la miniatura). Flechas del teclado para avanzar.
 */
export function Gallery({ items }: { items: { img: ImgKey; caption: string }[] }) {
  const t = useT()
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement | null>(null)
  const [index, setIndex] = useState(0)
  const total = items.length
  const open = (i: number, btn: HTMLButtonElement) => {
    opener.current = btn
    setIndex(i)
    dialog.current?.showModal()
  }
  const move = (delta: number) => setIndex((i) => (i + delta + total) % total)
  useEffect(() => {
    const d = dialog.current
    if (!d) return
    const onClose = () => opener.current?.focus()
    d.addEventListener('close', onClose)
    return () => d.removeEventListener('close', onClose)
  }, [])
  const current = items[index]

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4">
        {items.map((it, i) => (
          <li key={it.img} className={cn(i % 5 === 0 ? 'col-span-2 md:col-span-4 md:row-span-2' : 'md:col-span-2')}>
            <button type="button" onClick={(e) => open(i, e.currentTarget)} aria-label={t.project.openPhoto(i + 1)} className="group block h-full w-full overflow-hidden bg-mist">
              <img src={IMG[it.img].src} srcSet={IMG[it.img].srcSet} sizes={i % 5 === 0 ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 50vw'} alt={IMG[it.img].alt} loading="lazy" decoding="async" className="img-zoom aspect-[4/3] h-full w-full object-cover" style={{ objectPosition: IMG[it.img].pos }} />
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialog}
        aria-label={t.project.gallery}
        onKeyDown={(e) => { if (e.key === 'ArrowRight') move(1); if (e.key === 'ArrowLeft') move(-1) }}
        onClick={(e) => { if (e.target === dialog.current) dialog.current?.close() }}
        className="m-auto max-h-[94svh] w-[min(96vw,1400px)] bg-navy p-0 text-white backdrop:bg-navy/85"
      >
        {current && (
          <figure className="relative">
            <img src={IMG[current.img].src} srcSet={IMG[current.img].srcSet} sizes="96vw" alt={IMG[current.img].alt} className="max-h-[80svh] w-full object-contain" />
            <figcaption className="flex items-center justify-between gap-4 px-5 py-4 text-small text-white/80">
              <span>{current.caption}</span>
              <span className="font-mono text-[0.75rem] text-white/55" aria-live="polite">{t.project.photoOf(index + 1, total)}</span>
            </figcaption>
            <button type="button" onClick={() => dialog.current?.close()} aria-label={t.common.close} className="absolute right-3 top-3 grid h-11 w-11 place-items-center bg-navy/70 text-white hover:bg-navy"><X aria-hidden className="h-5 w-5" /></button>
            {total > 1 && (
              <>
                <button type="button" onClick={() => move(-1)} aria-label={t.project.prevPhoto} className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center bg-navy/70 text-white hover:bg-navy"><ChevronLeft aria-hidden className="h-5 w-5" /></button>
                <button type="button" onClick={() => move(1)} aria-label={t.project.nextPhoto} className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center bg-navy/70 text-white hover:bg-navy"><ChevronRight aria-hidden className="h-5 w-5" /></button>
              </>
            )}
          </figure>
        )}
      </dialog>
    </>
  )
}
