import { LOGO, LOGO_TILE } from '../../assets/brand'
import { cn } from '../../lib/utils'

/**
 * Logotipo oficial, sin redibujar ni recolorear.
 * - variant "color": versión transparente, sólo sobre fondos claros.
 * - variant "tile": placa azul oficial, para fondos oscuros o formato cuadrado.
 */
export function Logo({ className, size = 'md', variant = 'color' }: { className?: string; size?: 'sm' | 'md' | 'lg'; variant?: 'color' | 'tile' }) {
  const asset = variant === 'tile' ? LOGO_TILE : LOGO
  const h = { sm: 'h-11', md: 'h-[60px] md:h-[70px]', lg: 'h-28' }[size]
  return (
    <img
      src={asset.src}
      width={asset.width}
      height={asset.height}
      alt="Interfaz Telecomunicaciones"
      decoding="async"
      className={cn('block w-auto select-none', h, variant === 'tile' && 'rounded-[2px]', className)}
      draggable={false}
    />
  )
}

/** Emblema + nombre comercial. El emblema conserva su área de protección; el nombre
 *  acompaña a tamaños pequeños, donde el texto interno del emblema no es legible. */
export function LogoLockup() {
  return (
    <span className="flex items-center gap-3.5">
      <Logo />
      {/* Entre 1024 y 1279 px el menú completo ocupa ese espacio; ahí basta el emblema. */}
      <span aria-hidden className="hidden h-9 w-px bg-line min-[340px]:block lg:hidden xl:block" />
      <span aria-hidden className="hidden flex-col leading-[1.15] min-[340px]:flex lg:hidden xl:flex">
        <span className="font-display text-[1.02rem] font-semibold tracking-[-0.01em] text-ink">Interfaz Redes</span>
        <span className="text-[0.82rem] text-muted">y Telecomunicaciones</span>
      </span>
    </span>
  )
}
