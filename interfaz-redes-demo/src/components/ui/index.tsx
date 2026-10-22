import { m } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from '../../i18n/Link'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'secondary' | 'light' | 'outlineLight'

const base = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[2px] px-6 py-[0.8rem] text-[0.95rem] font-medium tracking-[0.005em] transition-[color,background-color,border-color,transform] duration-200 active:scale-[0.98]'
const variants: Record<Variant, string> = {
  primary: 'bg-corp text-white hover:bg-navy',
  secondary: 'border border-ink/20 text-ink hover:border-ink',
  light: 'bg-white text-navy hover:bg-ice',
  outlineLight: 'border border-white/40 text-white hover:border-white',
}

interface BtnProps {
  children: ReactNode
  variant?: Variant
  to?: string
  href?: string
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
  ariaLabel?: string
  /** Flecha que avanza al pasar el cursor (acciones que llevan a otra página). */
  arrow?: boolean
  /** Ubicación para el evento de medición quote_cta (botones que llevan al cotizador). */
  track?: string
}

export function Button({ children, variant = 'primary', to, href, onClick, className, type = 'button', ariaLabel, arrow, track }: BtnProps) {
  const cls = cn(base, variants[variant], className)
  const body = <>{children}{arrow && <ArrowRight aria-hidden className="arrow-nudge h-4 w-4" strokeWidth={1.75} />}</>
  if (to) return <Link to={to} className={cls} aria-label={ariaLabel} data-track-cta={track}>{body}</Link>
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls} aria-label={ariaLabel}>{body}</a>
  return <button type={type} onClick={onClick} className={cls} aria-label={ariaLabel} data-track-cta={track}>{body}</button>
}

export function SectionHead({ title, lede, dark, className, aside, id }: {
  title: ReactNode; lede?: ReactNode; dark?: boolean; className?: string; aside?: ReactNode; id?: string
}) {
  return (
    <div className={cn('grid gap-6 lg:grid-cols-12 lg:gap-10', className)}>
      <div className="lg:col-span-6">
        <h2 id={id} className={cn('text-h2', dark && '!text-white')}>{title}</h2>
      </div>
      {(lede || aside) && (
        <div className="lg:col-span-5 lg:col-start-8 lg:self-end">
          {lede && <p className={cn('max-w-measure', dark ? 'text-white/70' : 'text-body')}>{lede}</p>}
          {aside}
        </div>
      )}
    </div>
  )
}

/** Entrada al desplazarse: sólo posición (sin opacidad), así el contenido se lee aunque no cargue JavaScript. */
export function Reveal({ children, delay = 0, className, as = 'div' }: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'li' | 'section' | 'article' }) {
  const Comp = m[as]
  // Con «reducir movimiento», MotionConfig (App.tsx) lo pone en su lugar sin animar.
  return (
    <Comp className={className} initial={{ y: 16 }} whileInView={{ y: 0 }} viewport={{ once: true, margin: '0px 0px -6% 0px' }} transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}>
      {children}
    </Comp>
  )
}

export function Chip({ children, active, onClick, className, controls, count }: { children: ReactNode; active?: boolean; onClick?: () => void; className?: string; controls?: string; count?: number }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-controls={controls}
      onClick={onClick}
      className={cn('inline-flex items-center gap-2 rounded-[2px] border px-3.5 py-2 text-small transition-colors', active ? 'border-corp bg-corp text-white' : 'border-line bg-white text-body hover:border-corp hover:text-ink', className)}
    >
      {children}
      {count !== undefined && <span className={cn('font-mono text-[0.72rem] tabular', active ? 'text-white/70' : 'text-muted')}>{count}</span>}
    </button>
  )
}

export function TextLink({ to, children, className, dark }: { to: string; children: ReactNode; className?: string; dark?: boolean }) {
  return (
    <Link to={to} className={cn('group inline-flex items-center gap-2 text-[0.98rem] font-medium', dark ? 'text-white' : 'text-corp hover:text-navy', className)}>
      <span className="link-line">{children}</span>
      <ArrowRight aria-hidden className="arrow-nudge h-4 w-4" strokeWidth={1.75} />
    </Link>
  )
}

/** Etiqueta técnica pequeña (IBM Plex Mono): códigos, capas, etapas. */
export function Tag({ children, className, dark }: { children: ReactNode; className?: string; dark?: boolean }) {
  return <span className={cn('mono-tag uppercase', dark ? 'text-white/55' : 'text-muted', className)}>{children}</span>
}
