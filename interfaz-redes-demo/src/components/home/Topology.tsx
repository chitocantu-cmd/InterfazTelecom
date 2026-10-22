import { useState } from 'react'
import { useI18n } from '../../i18n'
import { Link } from '../../i18n/Link'
import { cn, useInView } from '../../lib/utils'
import { C, MONO } from '../plates/primitives'
import { Chip, SectionHead } from '../ui'

type Layer = 'todo' | 'fisica' | 'conectividad' | 'seguridad'
type Kind = 'net' | 'sec' | 'end' | 'wan'

type NodeId = 'isp' | 'fw' | 'core' | 'srv' | 'nvr' | 'idfa' | 'idfb' | 'ap' | 'pc' | 'tel' | 'cam' | 'acc' | 'cas'
/** Posición y tipo de cada equipo; sus textos están en los diccionarios (topology.nodes). */
interface Node { id: NodeId; x: number; y: number; kind: Kind; service?: string; w?: number }
interface Edge { a: string; b: string; type: 'fibra' | 'cobre' | 'inalambrico' | 'wan'; label?: string }

const NODES: Node[] = [
  { id: 'isp', x: 70, y: 250, kind: 'wan' },
  { id: 'fw', x: 205, y: 250, kind: 'net', service: 'redes-empresariales' },
  { id: 'core', x: 375, y: 250, kind: 'net', service: 'racks-y-site', w: 116 },
  { id: 'srv', x: 375, y: 100, kind: 'end' },
  { id: 'nvr', x: 375, y: 400, kind: 'sec', service: 'cctv-videovigilancia' },
  { id: 'idfa', x: 590, y: 150, kind: 'net', service: 'redes-empresariales', w: 116 },
  { id: 'idfb', x: 590, y: 360, kind: 'net', service: 'redes-empresariales', w: 116 },
  { id: 'ap', x: 840, y: 70, kind: 'net', service: 'wifi-empresarial' },
  { id: 'pc', x: 840, y: 150, kind: 'end', service: 'cableado-estructurado' },
  { id: 'tel', x: 840, y: 230, kind: 'end', service: 'telefonia-ip' },
  { id: 'cam', x: 840, y: 320, kind: 'sec', service: 'cctv-videovigilancia' },
  { id: 'acc', x: 840, y: 400, kind: 'sec', service: 'control-de-acceso', w: 128 },
  { id: 'cas', x: 840, y: 470, kind: 'sec', service: 'enlaces-inalambricos' },
]

const EDGES: Edge[] = [
  { a: 'isp', b: 'fw', type: 'wan' },
  { a: 'fw', b: 'core', type: 'cobre' },
  { a: 'core', b: 'srv', type: 'cobre' },
  { a: 'core', b: 'nvr', type: 'cobre' },
  { a: 'core', b: 'idfa', type: 'fibra', label: 'Fibra' },
  { a: 'core', b: 'idfb', type: 'fibra', label: 'Fibra' },
  { a: 'idfa', b: 'ap', type: 'cobre' },
  { a: 'idfa', b: 'pc', type: 'cobre' },
  { a: 'idfa', b: 'tel', type: 'cobre' },
  { a: 'idfb', b: 'cam', type: 'cobre' },
  { a: 'idfb', b: 'acc', type: 'cobre' },
  { a: 'idfb', b: 'cas', type: 'inalambrico', label: 'PtP' },
]

const LAYERS: Layer[] = ['todo', 'fisica', 'conectividad', 'seguridad']

const byId = (id: string) => NODES.find((n) => n.id === id)!

function nodeOn(n: Node, layer: Layer) {
  if (layer === 'todo') return true
  if (layer === 'fisica') return n.id === 'core' || n.id === 'idfa' || n.id === 'idfb'
  if (layer === 'conectividad') return n.kind === 'net'
  return n.kind === 'sec'
}
function edgeOn(e: Edge, layer: Layer) {
  if (layer === 'todo') return true
  if (layer === 'fisica') return e.type === 'fibra' || e.type === 'cobre'
  if (layer === 'conectividad') return byId(e.a).kind === 'net' && (byId(e.b).kind === 'net' || e.type === 'inalambrico')
  return byId(e.b).kind === 'sec' || (e.a === 'core' && e.b === 'idfb')
}

export function Topology() {
  const { t } = useI18n()
  const T = t.topology
  const [layer, setLayer] = useState<Layer>('todo')
  const [sel, setSel] = useState<NodeId>('core')
  const [ref, live] = useInView<HTMLDivElement>()
  const node = byId(sel)
  const text = T.nodes[sel]

  return (
    <section className="bg-mist py-24 md:py-28" aria-labelledby="topologia-title">
      <div className="container">
        <SectionHead id="topologia-title" title={T.title} lede={T.lede} />
        <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label={T.layersLabel}>
          {LAYERS.map((l) => (
            <Chip key={l} active={layer === l} onClick={() => setLayer(l)} controls="diagrama-red">{T.layers[l].label}</Chip>
          ))}
        </div>
        <p className="mt-4 max-w-prose text-[0.95rem] text-muted" aria-live="polite">{T.layers[layer].text}</p>

        <div ref={ref} className={cn('mt-8 grid gap-0 border border-line lg:grid-cols-12', live && 'topo-live')}>
          <div className="overflow-x-auto bg-[#EEF4F8] lg:col-span-9" id="diagrama-red">
            <svg viewBox="0 0 960 520" className="block w-full min-w-[720px]" role="group" aria-label={T.diagramLabel}>
              <rect width="960" height="520" fill={C.bg} />
              {/* site */}
              <rect x="290" y="50" width="170" height="410" fill="none" stroke={C.line} strokeDasharray="4 4" />
              <text x="298" y="44" fontFamily={MONO} fontSize="10" fill={C.muted} letterSpacing="1">{T.site}</text>
              <rect x="520" y="110" width="140" height="80" fill="none" stroke={C.soft} strokeDasharray="4 4" />
              <rect x="520" y="320" width="140" height="80" fill="none" stroke={C.soft} strokeDasharray="4 4" />
              {EDGES.map((e, i) => {
                const a = byId(e.a), b = byId(e.b)
                const on = edgeOn(e, layer)
                const mx = (a.x + b.x) / 2
                const d = a.y === b.y ? `M${a.x} ${a.y} H${b.x}` : a.x === b.x ? `M${a.x} ${a.y} V${b.y}` : `M${a.x} ${a.y} H${mx} V${b.y} H${b.x}`
                const color = e.type === 'fibra' ? C.accent : e.type === 'wan' ? C.line : C.ink
                return (
                  <g key={i} style={{ transition: 'opacity .35s' }} opacity={on ? 1 : 0.15}>
                    <path d={d} fill="none" stroke={color} strokeWidth={e.type === 'fibra' ? 2.4 : 1.4} strokeDasharray={e.type === 'inalambrico' ? '2 5' : e.type === 'wan' ? '6 4' : undefined} strokeLinecap="round" className={e.type === 'fibra' ? 'topo-fiber' : undefined} />
                    {e.label && (
                      <text x={mx + 6} y={(a.y + b.y) / 2 - 6} fontFamily={MONO} fontSize="9.5" fill={e.type === 'fibra' ? C.accent : C.muted}>{e.type === 'fibra' ? T.fiber : e.label}</text>
                    )}
                  </g>
                )
              })}
              {NODES.map((n) => {
                const on = nodeOn(n, layer)
                const w = n.w ?? 104
                const active = sel === n.id
                const fill = n.kind === 'net' ? C.ink : C.paper
                const txt = n.kind === 'net' ? '#fff' : C.ink
                const nt = T.nodes[n.id]
                return (
                  <g
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${nt.label}, ${nt.sub}`}
                    aria-pressed={active}
                    onClick={() => setSel(n.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(n.id) } }}
                    style={{ cursor: 'pointer', transition: 'opacity .35s', outline: 'none' }}
                    opacity={on ? 1 : 0.25}
                    className="topo-node"
                  >
                    <rect x={n.x - w / 2} y={n.y - 22} width={w} height="44" fill={fill} stroke={active ? C.accent : n.kind === 'net' ? C.ink : C.line} strokeWidth={active ? 2.5 : 1} />
                    {n.kind === 'sec' && <rect x={n.x - w / 2} y={n.y - 22} width="4" height="44" fill={C.accent} />}
                    <text x={n.x} y={n.y - 2} textAnchor="middle" fontFamily="'DM Sans', var(--cjk), Arial, sans-serif" fontSize="12" fontWeight="600" fill={txt}>{nt.label}</text>
                    <text x={n.x} y={n.y + 13} textAnchor="middle" fontFamily={MONO} fontSize="9" fill={n.kind === 'net' ? '#AEB6BC' : C.muted}>{nt.sub}</text>
                  </g>
                )
              })}
              {/* leyenda */}
              <g transform="translate(24 470)" fontFamily={MONO} fontSize="9.5" fill={C.muted}>
                <line x1="0" x2="26" y1="0" y2="0" stroke={C.accent} strokeWidth="2.4" /><text x="34" y="3">{T.fiber}</text>
                <line x1="90" x2="116" y1="0" y2="0" stroke={C.ink} strokeWidth="1.4" /><text x="124" y="3">{T.copper}</text>
                <line x1="0" x2="26" y1="20" y2="20" stroke={C.ink} strokeDasharray="2 5" strokeWidth="1.4" /><text x="34" y="23">{T.wireless}</text>
                <line x1="120" x2="146" y1="20" y2="20" stroke={C.line} strokeDasharray="6 4" strokeWidth="1.4" /><text x="154" y="23">{T.wan}</text>
              </g>
            </svg>
          </div>
          <aside className="flex flex-col border-t border-line bg-white p-6 lg:col-span-3 lg:border-l lg:border-t-0" aria-live="polite">
            <p className="text-small text-muted">{T.selected}</p>
            <p className="mt-3 font-display text-[1.4rem] font-semibold leading-tight text-ink">{text.label}</p>
            <p className="mono-tag mt-1 text-muted">{text.sub}</p>
            <p className="mt-4 text-[0.92rem] leading-relaxed text-muted">{text.info}</p>
            {node.service && (
              <Link to={`/soluciones/${node.service}`} className="mt-auto self-start pt-6 text-[0.9rem] font-medium text-corp"><span className="link-line">{T.related}</span></Link>
            )}
            <p className="mt-6 border-t border-line pt-4 font-mono text-[0.68rem] text-muted">{T.note}</p>
          </aside>
        </div>
        <p className="mt-3 font-mono text-[0.7rem] text-muted lg:hidden">{T.swipe}</p>
      </div>
    </section>
  )
}
