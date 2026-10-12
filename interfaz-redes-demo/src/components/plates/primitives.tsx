import { useId, type ReactNode } from 'react'

export const C = {
  bg: '#EEF4F8',
  paper: '#FFFFFF',
  ink: '#0B1F36',
  ink2: '#24384F',
  line: '#8FA3B5',
  soft: '#D3E0EA',
  softer: '#E3ECF2',
  red: '#176FB0',
  muted: '#5D7086',
  green: '#2F9E6E',
}

export const MONO = "'IBM Plex Mono', ui-monospace, Menlo, monospace"

export function PlateSvg({
  label,
  children,
  sheet,
  className,
  viewBox = '0 0 800 560',
  slice = true,
}: {
  label: string
  children: ReactNode
  sheet?: string
  className?: string
  viewBox?: string
  slice?: boolean
}) {
  const id = useId().replace(/:/g, '')
  const [x0, y0, w, h] = viewBox.split(' ').map(Number)
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio={slice ? 'xMidYMid slice' : 'xMidYMid meet'}
      role="img"
      aria-label={label}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', overflow: 'hidden' }}
    >
      <defs>
        <pattern id={`g${id}`} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M16 0H0V16" fill="none" stroke="rgba(18,60,101,0.06)" strokeWidth="1" />
        </pattern>
        <pattern id={`G${id}`} width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M80 0H0V80" fill="none" stroke="rgba(18,60,101,0.09)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="-2000" y="-2000" width="5000" height="5000" fill={C.bg} />
      <rect x="-2000" y="-2000" width="5000" height="5000" fill={`url(#g${id})`} />
      <rect x="-2000" y="-2000" width="5000" height="5000" fill={`url(#G${id})`} />
      {children}
      {sheet && (
        <g fontFamily={MONO} fontSize="9" fill={C.muted}>
          <text x={x0 + w - 16} y={y0 + h - 14} textAnchor="end" letterSpacing="1">
            {sheet}
          </text>
        </g>
      )}
    </svg>
  )
}

export function Callout({ x, y, tx, ty, letter, text, anchor = 'start', active = true }: {
  x: number; y: number; tx: number; ty: number; letter: string; text: string; anchor?: 'start' | 'end'; active?: boolean
}) {
  const col = active ? C.red : C.line
  return (
    <g style={{ transition: 'opacity .35s' }} opacity={active ? 1 : 0.55}>
      <polyline points={`${x},${y} ${tx},${ty}`} fill="none" stroke={col} strokeWidth="1" />
      <circle cx={x} cy={y} r="2.5" fill={col} />
      <circle cx={tx} cy={ty} r="9" fill={C.paper} stroke={col} strokeWidth="1" />
      <text x={tx} y={ty + 3.5} textAnchor="middle" fontFamily={MONO} fontSize="10" fontWeight="500" fill={active ? C.red : C.ink}>
        {letter}
      </text>
      <text x={anchor === 'start' ? tx + 16 : tx - 16} y={ty + 3.5} textAnchor={anchor} fontFamily={MONO} fontSize="10" fill={C.ink}>
        {text}
      </text>
    </g>
  )
}

export function Label({ x, y, children, anchor = 'start', size = 10, color = C.muted, weight = 400 }: {
  x: number | string; y: number | string; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; size?: number; color?: string; weight?: number
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontFamily={MONO} fontSize={size} fill={color} fontWeight={weight} letterSpacing="0.4">
      {children}
    </text>
  )
}

/** Sector circular para campo de visión de cámaras. */
export function fovPath(cx: number, cy: number, dirDeg: number, spreadDeg: number, r: number) {
  const a1 = ((dirDeg - spreadDeg / 2) * Math.PI) / 180
  const a2 = ((dirDeg + spreadDeg / 2) * Math.PI) / 180
  const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1)
  const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2)
  return `M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`
}

export function Camera({ x, y, dir, spread = 70, r = 110, ptz = false, active = true }: {
  x: number; y: number; dir: number; spread?: number; r?: number; ptz?: boolean; active?: boolean
}) {
  return (
    <g>
      {ptz ? (
        <circle cx={x} cy={y} r={r} fill="rgba(23,111,176,0.06)" stroke="rgba(23,111,176,0.45)" strokeDasharray="4 4" strokeWidth="1" />
      ) : (
        <path d={fovPath(x, y, dir, spread, r)} fill={active ? 'rgba(23,111,176,0.09)' : 'rgba(18,60,101,0.06)'} stroke={active ? 'rgba(23,111,176,0.5)' : C.line} strokeWidth="1" />
      )}
      <g transform={`translate(${x} ${y}) rotate(${dir})`}>
        {ptz ? (
          <circle r="6" fill={C.ink} />
        ) : (
          <>
            <rect x="-7" y="-4" width="12" height="8" rx="1" fill={C.ink} />
            <rect x="5" y="-2.5" width="4" height="5" fill={C.red} />
          </>
        )}
      </g>
    </g>
  )
}
