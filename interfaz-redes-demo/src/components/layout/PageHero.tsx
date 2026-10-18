import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IMG, type ImgKey } from '../../data/media'
import { cn } from '../../lib/utils'

export function Breadcrumbs({ items, dark }: { items: { to?: string; label: string }[]; dark?: boolean }) {
  return (
    <nav aria-label="Ruta de navegación">
      <ol className={cn('flex flex-wrap items-center gap-2 text-label', dark ? 'text-white/60' : 'text-muted')}>
        <li><Link to="/" className={dark ? 'hover:text-white' : 'hover:text-ink'}>Inicio</Link></li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            <span aria-hidden>/</span>
            {it.to ? <Link to={it.to} className={dark ? 'hover:text-white' : 'hover:text-ink'}>{it.label}</Link> : <span aria-current="page" className={dark ? 'text-white' : 'text-ink'}>{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Encabezado de página interior: claro, tipográfico y con imagen panorámica opcional. */
export function PageHero({ crumbs, title, lede, img, pos, children, aside }: {
  crumbs: { to?: string; label: string }[]
  kicker?: string
  title: ReactNode
  lede?: ReactNode
  img?: ImgKey
  pos?: string
  children?: ReactNode
  aside?: ReactNode
}) {
  return (
    <section className="bg-white">
      <div className="container pb-14 pt-10 md:pb-16 md:pt-12">
        <Breadcrumbs items={crumbs} />
        <div className="mt-12 grid gap-8 md:mt-16 lg:grid-cols-12 lg:items-start lg:gap-10">
          <h1 className="text-h1 lg:col-span-7">{title}</h1>
          {(lede || aside) && (
            <div className="lg:col-span-4 lg:col-start-9 lg:pt-2">
              {lede && <p className="max-w-measure text-lead text-body">{lede}</p>}
              {aside}
            </div>
          )}
        </div>
        {children}
      </div>
      {img && (
        <div className="relative mx-auto h-[300px] max-w-frame overflow-hidden md:h-[440px] lg:h-[520px]">
          <img src={IMG[img].src} srcSet={IMG[img].srcSet} sizes="(min-width: 1600px) 1600px, 100vw" alt={IMG[img].alt} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: pos ?? IMG[img].pos }} {...{ fetchpriority: 'high' }} />
          {IMG[img].ref && <p className="img-caption">Imagen de referencia</p>}
        </div>
      )}
    </section>
  )
}
