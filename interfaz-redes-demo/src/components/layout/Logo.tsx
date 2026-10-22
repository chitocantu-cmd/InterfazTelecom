import { LOGO, LOGO_TILE } from '../../assets/brand'
import { cn } from '../../lib/utils'

/**
 * Logotipo oficial, sin redibujar ni recolorear.
 * - variant "color": versión transparente, sólo sobre fondos claros.
 * - variant "tile": placa azul oficial, para fondos oscuros o formato cuadrado.
 */
export function Logo({ className, size = 'md', variant = 'color' }: { className?: string; size?: 'sm' | 'md' | 'lg'; variant?: 'color' | 'tile' }) {
  const asset = variant === 'tile' ? LOGO_TILE : LOGO
  const h = { sm: 'h-11', md: 'h-[84px] min-[375px]:h-[92px] md:h-[110px]', lg: 'h-28' }[size]
  return (
    <img
      src={asset.src}
      width={asset.width}
      height={asset.height}
      alt="Interfaz Redes y Telecomunicaciones"
      decoding="async"
      className={cn('block w-auto select-none', h, variant === 'tile' && 'rounded-[2px]', className)}
      draggable={false}
    />
  )
}

/** Emblema + nombre comercial. El emblema conserva su área de protección; el nombre acompaña donde hay espacio.
 *  `compact`: header compacto al desplazarse (el emblema se reduce con una transición). */
export function LogoLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3.5">
      <Logo className={cn('origin-left transition-[height] duration-300 ease-out', compact && '!h-[52px] md:!h-[60px]')} />
      {/* Entre 520 y 1023 px y desde 1280 px hay espacio para el nombre; en teléfonos lo ocupa el botón «Cotizar». */}
      <span aria-hidden className="hidden h-9 w-px bg-line min-[520px]:block lg:hidden xl:block" />
      <span aria-hidden className="hidden flex-col leading-[1.15] min-[520px]:flex lg:hidden xl:flex">
        <span className="font-display text-[1.02rem] font-semibold tracking-[-0.01em] text-ink">Interfaz Redes</span>
        {/* El espacio no se ve (flex), pero hace que el texto se lea "Interfaz Redes y Telecomunicaciones". */}
        {' '}
        <span className="text-[0.82rem] text-muted">y Telecomunicaciones</span>
      </span>
    </span>
  )
}
