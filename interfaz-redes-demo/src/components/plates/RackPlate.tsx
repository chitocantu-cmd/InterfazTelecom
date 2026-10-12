import { C, Callout, Label, MONO, PlateSvg } from './primitives'

export type RackGroup = 'fibra' | 'cableado' | 'redes' | 'seguridad' | 'energia'

const RX = 290 // riel izquierdo
const RW = 220 // ancho útil 19"
const U = 19 // alto de 1U en px
const TOP = 70

const uy = (n: number) => TOP + (n - 1) * U

function Ports({ x, y, cols, rows = 1, w = 6, h = 5, gx = 2.2, gy = 2, fill = C.ink, group = 0, groupGap = 4 }: {
  x: number; y: number; cols: number; rows?: number; w?: number; h?: number; gx?: number; gy?: number; fill?: string; group?: number; groupGap?: number
}) {
  const out = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const extra = group ? Math.floor(c / group) * groupGap : 0
      out.push(<rect key={`${r}-${c}`} x={x + c * (w + gx) + extra} y={y + r * (h + gy)} width={w} height={h} rx="0.6" fill={fill} />)
    }
  return <>{out}</>
}

function Manager({ n }: { n: number }) {
  const y = uy(n)
  return (
    <g>
      <rect x={RX} y={y + 2} width={RW} height={U - 4} fill={C.softer} stroke={C.line} strokeWidth="0.8" />
      {Array.from({ length: 6 }).map((_, i) => (
        <path key={i} d={`M${RX + 18 + i * 37} ${y + 4} q 8 7 0 11`} fill="none" stroke={C.line} strokeWidth="1.4" />
      ))}
    </g>
  )
}

export function RackElevation({ highlight, showCallouts = true, sheet = 'LÁM. INF-01 · ELEVACIÓN DE RACK · S/E', viewBox, fit = 'slice' }: {
  highlight?: RackGroup | null
  showCallouts?: boolean
  sheet?: string
  viewBox?: string
  fit?: 'slice' | 'meet'
}) {
  const dim = (g: RackGroup) => (!highlight || highlight === g ? 1 : 0.28)
  const hot = (g: RackGroup) => highlight === g
  const t = { transition: 'opacity .4s cubic-bezier(.2,.7,.2,1)' }

  return (
    <PlateSvg viewBox={viewBox} slice={fit === 'slice'} label="Elevación frontal de un rack de telecomunicaciones con distribuidor de fibra, patch panels, switches, NVR y UPS" sheet={sheet}>
      {/* gabinete */}
      <rect x={RX - 26} y={TOP - 22} width={RW + 52} height={22 * U + 44} fill={C.paper} stroke={C.ink} strokeWidth="1.5" />
      <rect x={RX - 14} y={TOP - 10} width={RW + 28} height={22 * U + 20} fill="none" stroke={C.soft} strokeWidth="1" />
      {/* rieles */}
      {[RX - 10, RX + RW + 2].map((x) => (
        <g key={x}>
          <rect x={x} y={TOP} width="8" height={22 * U} fill={C.softer} stroke={C.line} strokeWidth="0.8" />
          {Array.from({ length: 22 * 3 }).map((_, i) => (
            <rect key={i} x={x + 2.5} y={TOP + 2 + i * (U / 3)} width="3" height="2.2" fill={C.line} />
          ))}
        </g>
      ))}
      {/* numeración de U */}
      {Array.from({ length: 22 }).map((_, i) => (
        <text key={i} x={RX - 30} y={uy(i + 1) + 12} textAnchor="end" fontFamily={MONO} fontSize="7.5" fill={C.line}>
          {String(22 - i).padStart(2, '0')}
        </text>
      ))}

      {/* U1 distribuidor de fibra */}
      <g opacity={dim('fibra')} style={t}>
        <rect x={RX} y={uy(1) + 1} width={RW} height={U - 2} fill={hot('fibra') ? '#EAF3F9' : C.paper} stroke={hot('fibra') ? C.red : C.ink} strokeWidth="1" />
        <Ports x={RX + 14} y={uy(1) + 6} cols={12} w={4} h={7} gx={9} fill={C.ink2} />
        <Ports x={RX + 19} y={uy(1) + 6} cols={12} w={4} h={7} gx={9} fill={C.ink2} />
        <text x={RX + RW - 8} y={uy(1) + 12.5} textAnchor="end" fontFamily={MONO} fontSize="6.5" fill={C.muted}>LC</text>
      </g>
      <Manager n={2} />
      {/* U3, U5 patch panels */}
      {[3, 5].map((n) => (
        <g key={n} opacity={dim('cableado')} style={t}>
          <rect x={RX} y={uy(n) + 1} width={RW} height={U - 2} fill={hot('cableado') ? '#EAF3F9' : C.paper} stroke={hot('cableado') ? C.red : C.ink} strokeWidth="1" />
          <Ports x={RX + 12} y={uy(n) + 6.5} cols={24} w={6} h={6} gx={1.6} group={6} groupGap={4} />
          <rect x={RX + 12} y={uy(n) + 2.5} width={RW - 24} height="2" fill={C.soft} />
        </g>
      ))}
      <Manager n={4} />
      <Manager n={6} />
      {/* U7, U8 switches */}
      {[7, 8].map((n) => (
        <g key={n} opacity={dim('redes')} style={t}>
          <rect x={RX} y={uy(n) + 1} width={RW} height={U - 2} fill={C.ink} stroke={hot('redes') ? C.red : C.ink} strokeWidth="1.2" />
          <Ports x={RX + 8} y={uy(n) + 3.5} cols={24} rows={2} w={5} h={4.4} gx={1.6} gy={1.6} fill="#5E6872" group={8} groupGap={3} />
          <Ports x={RX + RW - 38} y={uy(n) + 4.5} cols={4} w={6} h={8} gx={2} fill={hot('redes') || hot('fibra') ? C.red : '#8A949D'} />
          {Array.from({ length: 10 }).map((_, i) => (
            <circle key={i} cx={RX + 12 + i * 15} cy={uy(n) + U - 3} r="0.9" fill={C.green} />
          ))}
        </g>
      ))}
      <Manager n={9} />
      {/* U10 router / firewall */}
      <g opacity={dim('redes')} style={t}>
        <rect x={RX} y={uy(10) + 1} width={RW} height={U - 2} fill={C.ink2} stroke={hot('redes') ? C.red : C.ink} strokeWidth="1" />
        <Ports x={RX + 120} y={uy(10) + 5} cols={8} w={7} h={7} gx={3} fill="#6F7983" />
        <rect x={RX + 10} y={uy(10) + 6} width="40" height="5" fill="#59636C" />
        <circle cx={RX + 60} cy={uy(10) + 9} r="1.4" fill={C.green} />
      </g>
      {/* U11 vacío, U12 tapa */}
      <rect x={RX} y={uy(12) + 1} width={RW} height={U - 2} fill={C.softer} stroke={C.soft} strokeWidth="0.8" />
      {/* U13-14 NVR */}
      <g opacity={dim('seguridad')} style={t}>
        <rect x={RX} y={uy(13) + 1} width={RW} height={2 * U - 2} fill={C.paper} stroke={hot('seguridad') ? C.red : C.ink} strokeWidth="1" />
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={i}>
            <rect x={RX + 10 + i * 24} y={uy(13) + 6} width="20" height={2 * U - 12} fill={C.softer} stroke={C.line} strokeWidth="0.7" />
            <circle cx={RX + 20 + i * 24} cy={uy(13) + 2 * U - 10} r="1.2" fill={hot('seguridad') ? C.red : C.green} />
          </g>
        ))}
      </g>
      {/* U15 */}
      <rect x={RX} y={uy(15) + 1} width={RW} height={U - 2} fill={C.softer} stroke={C.soft} strokeWidth="0.8" />
      {/* U16-17 servidor */}
      <g>
        <rect x={RX} y={uy(16) + 1} width={RW} height={2 * U - 2} fill={C.paper} stroke={C.ink} strokeWidth="1" opacity={highlight ? 0.28 : 1} style={t} />
        {Array.from({ length: 3 }).map((_, i) => (
          <line key={i} x1={RX + 14} x2={RX + RW - 70} y1={uy(16) + 9 + i * 9} y2={uy(16) + 9 + i * 9} stroke={C.soft} strokeWidth="3" opacity={highlight ? 0.28 : 1} />
        ))}
      </g>
      {/* U18 PDU */}
      <g opacity={dim('energia')} style={t}>
        <rect x={RX} y={uy(18) + 1} width={RW} height={U - 2} fill={C.ink2} stroke={C.ink} strokeWidth="1" />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={RX + 14 + i * 25} y={uy(18) + 5} width="12" height="9" rx="1.5" fill="#6F7983" />
        ))}
      </g>
      {/* U19 vacío */}
      {/* U20-22 UPS */}
      <g opacity={dim('energia')} style={t}>
        <rect x={RX} y={uy(20) + 1} width={RW} height={3 * U - 2} fill={C.ink} stroke={C.ink} strokeWidth="1" />
        <rect x={RX + RW - 70} y={uy(20) + 12} width="44" height="20" fill="#2B3239" stroke="#5E6872" strokeWidth="0.8" />
        <text x={RX + RW - 48} y={uy(20) + 25} textAnchor="middle" fontFamily={MONO} fontSize="7" fill="#9FE3C2">100%</text>
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={RX + 14 + i * 12} x2={RX + 14 + i * 12} y1={uy(20) + 10} y2={uy(20) + 3 * U - 10} stroke="#2E353C" strokeWidth="5" />
        ))}
      </g>

      {/* patch cords cobre: patch panel -> switch */}
      <g opacity={highlight && highlight !== 'cableado' && highlight !== 'redes' ? 0.25 : 1} style={t} fill="none" strokeLinecap="round">
        {Array.from({ length: 9 }).map((_, i) => {
          const x1 = RX + 15 + i * 7.6 + Math.floor(i / 6) * 4
          const x2 = RX + 11 + i * 6.6
          return <path key={`a${i}`} d={`M${x1} ${uy(5) + 12} C ${x1} ${uy(6) + 14}, ${x2 - 6} ${uy(6) + 8}, ${x2} ${uy(7) + 4}`} stroke={hot('cableado') ? C.red : '#4B545C'} strokeWidth="1.3" />
        })}
        {Array.from({ length: 7 }).map((_, i) => {
          const x1 = RX + 120 + i * 7.6
          const x2 = RX + 120 + i * 6.6
          return <path key={`b${i}`} d={`M${x1} ${uy(3) + 12} C ${x1 + 4} ${uy(4) + 10}, ${x2 + 30} ${uy(6) + 4}, ${x2 + 2} ${uy(8) + 4}`} stroke={hot('cableado') ? C.red : '#6A747D'} strokeWidth="1.2" />
        })}
      </g>
      {/* jumpers de fibra: distribuidor -> SFP */}
      <g opacity={dim('fibra')} style={t} fill="none" strokeLinecap="round">
        <path d={`M${RX + 168} ${uy(1) + 13} C ${RX + 200} ${uy(2) + 14}, ${RX + RW - 6} ${uy(4)}, ${RX + RW - 30} ${uy(7) + 8}`} stroke={C.red} strokeWidth="1.6" />
        <path d={`M${RX + 181} ${uy(1) + 13} C ${RX + 212} ${uy(3)}, ${RX + RW - 2} ${uy(5)}, ${RX + RW - 14} ${uy(8) + 8}`} stroke={C.red} strokeWidth="1.6" />
      </g>

      {/* cota */}
      <g stroke={C.line} strokeWidth="0.8">
        <line x1={RX + RW + 40} y1={TOP} x2={RX + RW + 40} y2={TOP + 22 * U} />
        <line x1={RX + RW + 34} y1={TOP} x2={RX + RW + 46} y2={TOP} />
        <line x1={RX + RW + 34} y1={TOP + 22 * U} x2={RX + RW + 46} y2={TOP + 22 * U} />
      </g>
      <text x={RX + RW + 52} y={TOP + 11 * U} fontFamily={MONO} fontSize="9" fill={C.muted} transform={`rotate(90 ${RX + RW + 52} ${TOP + 11 * U})`} textAnchor="middle">22U · 19″</text>

      {showCallouts && (
        <g>
          <Callout x={RX + 4} y={uy(1) + 9} tx={140} ty={uy(1) + 4} letter="A" text="Fibra · LC" anchor="end" active={!highlight || hot('fibra')} />
          <Callout x={RX + 4} y={uy(3) + 9} tx={140} ty={uy(4)} letter="B" text="Patch panel" anchor="end" active={!highlight || hot('cableado')} />
          <Callout x={RX + 4} y={uy(7) + 9} tx={140} ty={uy(7) + 8} letter="C" text="Switch PoE" anchor="end" active={!highlight || hot('redes')} />
          <Callout x={RX + 4} y={uy(14)} tx={140} ty={uy(13) + 14} letter="D" text="NVR" anchor="end" active={!highlight || hot('seguridad')} />
          <Callout x={RX + 4} y={uy(21)} tx={140} ty={uy(21)} letter="E" text="UPS" anchor="end" active={!highlight || hot('energia')} />
          <Label x={620} y={uy(10) + 12}>FW / ROUTER</Label>
          <line x1={RX + RW + 8} y1={uy(10) + 9} x2={612} y2={uy(10) + 9} stroke={C.line} strokeWidth="0.8" />
          <Label x={620} y={uy(16) + 20}>SERVIDOR</Label>
          <line x1={RX + RW + 8} y1={uy(16) + 17} x2={612} y2={uy(16) + 17} stroke={C.line} strokeWidth="0.8" />
        </g>
      )}
    </PlateSvg>
  )
}
