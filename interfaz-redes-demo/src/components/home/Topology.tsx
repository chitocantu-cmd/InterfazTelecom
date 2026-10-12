import { useState } from 'react'
import { Link } from 'react-router-dom'
import { C, MONO } from '../plates/primitives'
import { Chip, SectionHead } from '../ui'

type Layer = 'todo' | 'fisica' | 'conectividad' | 'seguridad'
type Kind = 'net' | 'sec' | 'end' | 'wan'

interface Node { id: string; x: number; y: number; label: string; sub: string; kind: Kind; info: string; service?: string; w?: number }
interface Edge { a: string; b: string; type: 'fibra' | 'cobre' | 'inalambrico' | 'wan'; label?: string }

const NODES: Node[] = [
  { id: 'isp', x: 70, y: 250, label: 'Internet', sub: 'Proveedor', kind: 'wan', info: 'Enlace del proveedor de servicio. Llega al site y termina en el router o firewall.' },
  { id: 'fw', x: 205, y: 250, label: 'Router / FW', sub: 'Perímetro', kind: 'net', info: 'Salida a internet y control del tráfico entre la red interna y el exterior.', service: 'switching-routing' },
  { id: 'core', x: 375, y: 250, label: 'Switch núcleo', sub: 'Site · MDF', kind: 'net', info: 'Centro de la red en el site principal. Recibe los enlaces de fibra de cada cuarto de distribución.', service: 'racks-y-site', w: 116 },
  { id: 'srv', x: 375, y: 100, label: 'Servidores', sub: 'Site', kind: 'end', info: 'Servicios internos conectados directamente al núcleo.' },
  { id: 'nvr', x: 375, y: 400, label: 'NVR', sub: 'Grabación', kind: 'sec', info: 'Grabación centralizada de video en el site, con almacenamiento y acceso remoto controlado.', service: 'cctv-videovigilancia' },
  { id: 'idfa', x: 590, y: 150, label: 'Switch acceso', sub: 'IDF-A · PoE', kind: 'net', info: 'Cuarto de distribución en oficinas. Alimenta por PoE access points y teléfonos.', service: 'switching-routing', w: 116 },
  { id: 'idfb', x: 590, y: 360, label: 'Switch acceso', sub: 'IDF-B · PoE', kind: 'net', info: 'Cuarto de distribución en nave. Alimenta cámaras y controladoras de acceso.', service: 'switching-routing', w: 116 },
  { id: 'ap', x: 840, y: 70, label: 'Access points', sub: 'WiFi', kind: 'net', info: 'Cobertura inalámbrica diseñada con site survey y alimentada por PoE.', service: 'wifi-empresarial' },
  { id: 'pc', x: 840, y: 150, label: 'Estaciones', sub: 'Datos', kind: 'end', info: 'Puestos de trabajo conectados por cableado estructurado certificado.', service: 'cableado-estructurado' },
  { id: 'tel', x: 840, y: 230, label: 'Telefonía IP', sub: 'Voz', kind: 'end', info: 'Voz sobre la red de datos, en su propio segmento y con prioridad.', service: 'telefonia-ip' },
  { id: 'cam', x: 840, y: 320, label: 'Cámaras IP', sub: 'CCTV', kind: 'sec', info: 'Cámaras alimentadas por PoE en un segmento dedicado hacia el NVR.', service: 'cctv-videovigilancia' },
  { id: 'acc', x: 840, y: 400, label: 'Control de acceso', sub: 'Controladora', kind: 'sec', info: 'Controladoras de puertas conectadas a la red para permisos y reportes.', service: 'control-de-acceso', w: 128 },
  { id: 'cas', x: 840, y: 470, label: 'Caseta', sub: 'Enlace PtP', kind: 'sec', info: 'Ubicación remota conectada por enlace inalámbrico punto a punto.', service: 'enlaces-inalambricos' },
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

const LAYERS: { id: Layer; label: string; text: string }[] = [
  { id: 'todo', label: 'Toda la red', text: 'Una red empresarial típica: site principal, cuartos de distribución conectados por fibra y equipos finales por cobre.' },
  { id: 'fisica', label: 'Infraestructura física', text: 'Cableado estructurado y fibra óptica: el medio por el que viaja todo lo demás. Se diseña, se instala y se certifica.' },
  { id: 'conectividad', label: 'Conectividad', text: 'Router, switching y WiFi: segmentan, priorizan y entregan la red a cada usuario y dispositivo.' },
  { id: 'seguridad', label: 'Seguridad electrónica', text: 'Cámaras, NVR y control de acceso comparten infraestructura, en su propio segmento de red.' },
]

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
  const [layer, setLayer] = useState<Layer>('todo')
  const [sel, setSel] = useState<string>('core')
  const node = byId(sel)
  const L = LAYERS.find((l) => l.id === layer)!

  return (
    <section className="bg-mist py-24 md:py-28" aria-labelledby="topologia-title">
      <div className="container">
        <SectionHead
          id="topologia-title"
          title="Cómo se integra una red empresarial"
          lede="Los servicios no se instalan aislados. Seleccione una capa o un equipo para ver qué papel cumple."
        />
        <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Capas de la red">
          {LAYERS.map((l) => (
            <Chip key={l.id} active={layer === l.id} onClick={() => setLayer(l.id)} controls="diagrama-red">{l.label}</Chip>
          ))}
        </div>
        <p className="mt-4 max-w-prose text-[0.95rem] text-slate-muted" aria-live="polite">{L.text}</p>

        <div className="mt-8 grid gap-0 border border-line lg:grid-cols-12">
          <div className="overflow-x-auto bg-[#EEF4F8] lg:col-span-9" id="diagrama-red">
            <svg viewBox="0 0 960 520" className="block w-full min-w-[720px]" role="group" aria-label="Diagrama de topología de red empresarial">
              <rect width="960" height="520" fill={C.bg} />
              {/* site */}
              <rect x="290" y="50" width="170" height="410" fill="none" stroke={C.line} strokeDasharray="4 4" />
              <text x="298" y="44" fontFamily={MONO} fontSize="10" fill={C.muted} letterSpacing="1">SITE PRINCIPAL</text>
              <rect x="520" y="110" width="140" height="80" fill="none" stroke={C.soft} strokeDasharray="4 4" />
              <rect x="520" y="320" width="140" height="80" fill="none" stroke={C.soft} strokeDasharray="4 4" />
              {EDGES.map((e, i) => {
                const a = byId(e.a), b = byId(e.b)
                const on = edgeOn(e, layer)
                const mx = (a.x + b.x) / 2
                const d = a.y === b.y ? `M${a.x} ${a.y} H${b.x}` : a.x === b.x ? `M${a.x} ${a.y} V${b.y}` : `M${a.x} ${a.y} H${mx} V${b.y} H${b.x}`
                const color = e.type === 'fibra' ? C.red : e.type === 'wan' ? C.line : C.ink
                return (
                  <g key={i} style={{ transition: 'opacity .35s' }} opacity={on ? 1 : 0.15}>
                    <path d={d} fill="none" stroke={color} strokeWidth={e.type === 'fibra' ? 2.4 : 1.4} strokeDasharray={e.type === 'inalambrico' ? '2 5' : e.type === 'wan' ? '6 4' : undefined} strokeLinecap="round" />
                    {e.label && (
                      <text x={mx + 6} y={(a.y + b.y) / 2 - 6} fontFamily={MONO} fontSize="9.5" fill={e.type === 'fibra' ? C.red : C.muted}>{e.label}</text>
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
                return (
                  <g
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${n.label}, ${n.sub}`}
                    aria-pressed={active}
                    onClick={() => setSel(n.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(n.id) } }}
                    style={{ cursor: 'pointer', transition: 'opacity .35s', outline: 'none' }}
                    opacity={on ? 1 : 0.25}
                    className="topo-node"
                  >
                    <rect x={n.x - w / 2} y={n.y - 22} width={w} height="44" fill={fill} stroke={active ? C.red : n.kind === 'net' ? C.ink : C.line} strokeWidth={active ? 2.5 : 1} />
                    {n.kind === 'sec' && <rect x={n.x - w / 2} y={n.y - 22} width="4" height="44" fill={C.red} />}
                    <text x={n.x} y={n.y - 2} textAnchor="middle" fontFamily="'DM Sans', Arial, sans-serif" fontSize="12" fontWeight="600" fill={txt}>{n.label}</text>
                    <text x={n.x} y={n.y + 13} textAnchor="middle" fontFamily={MONO} fontSize="9" fill={n.kind === 'net' ? '#AEB6BC' : C.muted}>{n.sub}</text>
                  </g>
                )
              })}
              {/* leyenda */}
              <g transform="translate(24 470)" fontFamily={MONO} fontSize="9.5" fill={C.muted}>
                <line x1="0" x2="26" y1="0" y2="0" stroke={C.red} strokeWidth="2.4" /><text x="34" y="3">Fibra</text>
                <line x1="90" x2="116" y1="0" y2="0" stroke={C.ink} strokeWidth="1.4" /><text x="124" y="3">Cobre</text>
                <line x1="0" x2="26" y1="20" y2="20" stroke={C.ink} strokeDasharray="2 5" strokeWidth="1.4" /><text x="34" y="23">Inalámbrico</text>
                <line x1="120" x2="146" y1="20" y2="20" stroke={C.line} strokeDasharray="6 4" strokeWidth="1.4" /><text x="154" y="23">WAN</text>
              </g>
            </svg>
          </div>
          <aside className="flex flex-col border-t border-line bg-paper p-6 lg:col-span-3 lg:border-l lg:border-t-0" aria-live="polite">
            <p className="text-small text-muted">Equipo seleccionado</p>
            <p className="mt-3 font-display text-[1.4rem] font-semibold leading-tight text-ink">{node.label}</p>
            <p className="mono-tag mt-1 text-slate-muted">{node.sub}</p>
            <p className="mt-4 text-[0.92rem] leading-relaxed text-slate-muted">{node.info}</p>
            {node.service && (
              <Link to={`/soluciones/${node.service}`} className="mt-auto pt-6 text-[0.9rem] font-medium text-tech link-underline">Ver servicio relacionado</Link>
            )}
            <p className="mt-6 border-t border-line pt-4 font-mono text-[0.68rem] text-slate-muted">Diagrama de referencia. Cada red se diseña según el levantamiento.</p>
          </aside>
        </div>
        <p className="mt-3 font-mono text-[0.7rem] text-slate-muted lg:hidden">Deslice el diagrama horizontalmente para verlo completo.</p>
      </div>
    </section>
  )
}
