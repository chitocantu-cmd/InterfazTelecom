import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'secondary' | 'light' | 'outlineLight'

const base = 'inline-flex items-center justify-center whitespace-nowrap rounded-[2px] px-6 py-[0.8rem] text-[0.95rem] font-medium tracking-[0.005em] transition-colors duration-200'
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
}

export function Button({ children, variant = 'primary', to, href, onClick, className, type = 'button', ariaLabel }: BtnProps) {
  const cls = cn(base, variants[variant], className)
  if (to) return <Link to={to} className={cls} aria-label={ariaLabel}>{children}</Link>
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className={cls} aria-label={ariaLabel}>{children}</a>
  return <button type={type} onClick={onClick} className={cls} aria-label={ariaLabel}>{children}</button>
}

/** Rótulo de sección. Se usa sólo cuando ubica al lector, no encima de cada título. */
export function Overline({ children, className, dark }: { children: ReactNode; className?: string; dark?: boolean }) {
  return <p className={cn('overline', dark && '!text-lumen', className)}>{children}</p>
}
export const Kicker = Overline

export function SectionHead({ overline, kicker, title, lede, dark, className, aside, id }: {
  overline?: string; kicker?: string; title: ReactNode; lede?: ReactNode; dark?: boolean; className?: string; aside?: ReactNode; id?: string
}) {
  const label = overline ?? kicker
  return (
    <div className={cn('grid gap-6 lg:grid-cols-12 lg:gap-10', className)}>
      <div className="lg:col-span-6">
        {label && <Overline dark={dark} className="mb-4">{label}</Overline>}
        <h2 id={id} className={cn('text-h2', dark && '!text-white')}>{title}</h2>
      </div>
      {(lede || aside) && (
        <div className="lg:col-span-5 lg:col-start-8 lg:self-end">
          {lede && <p className={cn('max-w-measure text-body', dark ? 'text-white/70' : 'text-body')}>{lede}</p>}
          {aside}
        </div>
      )}
    </div>
  )
}

export function Reveal({ children, delay = 0, className, as = 'div' }: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'li' | 'section' | 'article' }) {
  const reduce = useReducedMotion()
  const Comp = motion[as]
  if (reduce) return <Comp className={className}>{children}</Comp>
  return (
    <Comp className={className} initial={{ y: 16 }} whileInView={{ y: 0 }} viewport={{ once: true, margin: '0px 0px -6% 0px' }} transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}>
      {children}
    </Comp>
  )
}

export function Chip({ children, active, onClick, className, controls }: { children: ReactNode; active?: boolean; onClick?: () => void; className?: string; controls?: string; dark?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-controls={controls}
      onClick={onClick}
      className={cn('rounded-[2px] border px-3.5 py-2 text-small transition-colors', active ? 'border-corp bg-corp text-white' : 'border-line bg-white text-body hover:border-corp hover:text-ink', className)}
    >
      {children}
    </button>
  )
}

export function DemoTag({ children = 'Caso demostrativo', className, dark }: { children?: ReactNode; className?: string; dark?: boolean }) {
  return <span className={cn('text-label', dark ? 'text-white/60' : 'text-muted', className)}>{children}</span>
}

export function TextLink({ to, children, className, dark }: { to: string; children: ReactNode; className?: string; dark?: boolean }) {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2 text-[0.98rem] font-medium', dark ? 'text-white' : 'text-corp hover:text-navy', className)}>
      <span className="link-line">{children}</span>
    </Link>
  )
}
