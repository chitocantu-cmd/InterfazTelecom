import { lazy, Suspense } from 'react'
import type { PlateKind } from '../../data/solutions'
import { IMG, type ImgKey } from '../../data/media'
import { cn } from '../../lib/utils'

// Las láminas técnicas (SVG) sólo se dibujan donde no hay imagen: se descargan aparte, cuando hacen falta.
const Plate = lazy(() => import('./Plate'))

/** Espacio de imagen. Usa la visualización si existe; si no, la lámina técnica.
 *  Se carga al acercarse a la pantalla salvo `eager`; `sizes` es el ancho que ocupa (para elegir del srcset). */
export function Media({ img, plate, className, ratio = 'aspect-[16/10]', zoom = false, eager = false, sizes = '(min-width: 1024px) 50vw, 100vw', pos, caption }: {
  img?: ImgKey
  plate: PlateKind
  className?: string
  ratio?: string
  tag?: boolean
  zoom?: boolean
  eager?: boolean
  sizes?: string
  pos?: string
  caption?: string
}) {
  const m = img ? IMG[img] : null
  return (
    <figure className={cn('relative overflow-hidden bg-mist', ratio, className)}>
      {m ? (
        <img src={m.src} srcSet={m.srcSet} sizes={sizes} alt={m.alt} loading={eager ? undefined : 'lazy'} decoding="async" className={cn('absolute inset-0 h-full w-full object-cover', zoom && 'img-zoom')} style={{ objectPosition: pos ?? m.pos }} />
      ) : (
        <div className="absolute inset-0 bg-[#F1F5F8]"><Suspense fallback={null}><Plate kind={plate} /></Suspense></div>
      )}
      {caption && <figcaption className="absolute bottom-3 right-4 text-[0.72rem] text-white/70 [text-shadow:0_1px_2px_rgba(0,0,0,.4)]">{caption}</figcaption>}
    </figure>
  )
}
