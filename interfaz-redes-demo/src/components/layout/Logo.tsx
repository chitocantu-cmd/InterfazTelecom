import { LOGO, LOGO_TILE } from '../../assets/brand'
import { cn } from '../../lib/utils'

/**
 * Logotipo oficial, sin redibujar ni recolorear.
 * - variant "color": versión transparente, sólo sobre fondos claros.
 * - variant "tile": placa azul oficial, para fondos oscuros o formato cuadrado.
 */
export function Logo({ className, size = 'md', variant = 'color' }: { className?: string; size?: 'sm' | 'md' | 'lg'; variant?: 'color' | 'tile' }) {
  const asset = variant === 'tile' ? LOGO_TILE : LOGO
  const h = { sm: 'h-11', md: 'h-[64px] min-[375px]:h-[68px] md:h-[110px]', lg: 'h-28' }[size]
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
    <span className="flex items-center gap-2 min-[520px]:gap-3.5">
      <Logo className={cn('origin-left transition-[height] duration-300 ease-out', compact && '!h-[52px] md:!h-[60px]')} />
      {/* El emblema es detallado: el nombre al lado lo hace reconocible a tamaño de teléfono. Desde 360 px cabe junto al
          botón «Cotizar»; entre 1024 y 1439 px lo ocupa el menú completo con el selector de idioma. */}
      <span aria-hidden className="hidden h-9 w-px bg-line min-[520px]:block lg:hidden min-[1440px]:block" />
      <span aria-hidden className="hidden flex-col leading-[1.15] min-[360px]:flex lg:hidden min-[1440px]:flex">
        <span className="font-display text-[0.95rem] font-semibold tracking-[-0.01em] text-ink min-[520px]:text-[1.02rem]">Interfaz Redes</span>
        {/* El espacio no se ve (flex), pero hace que el texto se lea "Interfaz Redes y Telecomunicaciones". */}
        {' '}
        <span className="text-[0.72rem] text-muted min-[520px]:text-[0.82rem]">y Telecomunicaciones</span>
      </span>
    </span>
  )
}
