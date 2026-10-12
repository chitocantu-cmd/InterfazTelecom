import { C, Callout, Camera, Label, MONO, PlateSvg } from './primitives'

/* ---------- Fibra óptica: enlace entre edificios + traza OTDR ---------- */
export function FiberPlate() {
  // traza OTDR (ejemplo ilustrativo)
  const ox = 70, oy = 420, ow = 430, oh = 100
  const trace = [
    [0, 8], [6, 2], [12, 22], [140, 38], [141, 44], [250, 58], [251, 62], [254, 50], [258, 66], [360, 80], [362, 66], [366, 88], [372, 96], [430, 97],
  ]
    .map(([x, y], i) => `${i ? 'L' : 'M'}${ox + x},${oy + y}`)
    .join(' ')
  return (
    <PlateSvg label="Corte esquemático de un enlace de fibra óptica subterráneo entre dos edificios y traza OTDR de ejemplo" sheet="LÁM. INF-02 · ENLACE ENTRE EDIFICIOS · S/E">
      {/* terreno */}
      <line x1="20" y1="320" x2="780" y2="320" stroke={C.ink} strokeWidth="1.5" />
      {Array.from({ length: 48 }).map((_, i) => (
        <line key={i} x1={24 + i * 16} y1="322" x2={16 + i * 16} y2="330" stroke={C.line} strokeWidth="0.8" />
      ))}
      {/* edificio A */}
      <rect x="60" y="90" width="200" height="230" fill={C.paper} stroke={C.ink} strokeWidth="1.4" />
      {[0, 1, 2, 3].map((f) => (
        <g key={f}>
          <line x1="60" x2="260" y1={90 + f * 57.5} y2={90 + f * 57.5} stroke={C.soft} />
          {[0, 1, 2, 3, 4].map((w) => (
            <rect key={w} x={74 + w * 37} y={104 + f * 57.5} width="24" height="28" fill={C.softer} stroke={C.soft} />
          ))}
        </g>
      ))}
      <rect x="84" y="268" width="56" height="44" fill="#EAF3F9" stroke={C.red} strokeWidth="1.2" />
      <rect x="96" y="276" width="14" height="30" fill={C.ink} />
      <rect x="114" y="276" width="14" height="30" fill={C.ink2} />
      <Label x="60" y="80" color={C.ink} weight={500}>EDIFICIO A · SITE PRINCIPAL</Label>
      {/* nave B */}
      <path d="M520 320 V170 L560 140 V170 L600 140 V170 L640 140 V170 L680 140 V170 L720 140 V320 Z" fill={C.paper} stroke={C.ink} strokeWidth="1.4" />
      <rect x="640" y="262" width="56" height="50" fill="#EAF3F9" stroke={C.red} strokeWidth="1.2" />
      <rect x="652" y="270" width="14" height="36" fill={C.ink} />
      <rect x="548" y="240" width="60" height="80" fill={C.softer} stroke={C.soft} />
      <Label x="520" y="128" color={C.ink} weight={500}>NAVE B · CUARTO DE DISTRIBUCIÓN</Label>
      {/* ducto y registros */}
      <path d="M112 312 V372 H668 V312" fill="none" stroke={C.line} strokeWidth="10" strokeLinejoin="round" opacity="0.45" />
      <path d="M112 312 V372 H668 V312" fill="none" stroke={C.red} strokeWidth="2" strokeDasharray="10 5" strokeLinejoin="round">
        <animate attributeName="stroke-dashoffset" from="30" to="0" dur="1.6s" repeatCount="indefinite" />
      </path>
      {[300, 480].map((x) => (
        <g key={x}>
          <rect x={x - 14} y="320" width="28" height="64" fill="none" stroke={C.ink} strokeWidth="1" />
          <line x1={x - 18} x2={x + 18} y1="320" y2="320" stroke={C.ink} strokeWidth="3" />
        </g>
      ))}
      <Callout x={112} y={340} tx={30} ty={250} letter="A" text="" />
      <Callout x={300} y={352} tx={330} ty={250} letter="B" text="Registro" />
      <Callout x={560} y={372} tx={560} ty={404} letter="C" text="Ducto · fibra monomodo" />
      <Callout x={668} y={290} tx={748} ty={230} letter="D" text="" anchor="end" />
      {/* OTDR */}
      <rect x={ox - 12} y={oy - 26} width={ow + 24} height={oh + 44} fill={C.paper} stroke={C.soft} />
      <Label x={ox} y={oy - 10} color={C.ink} weight={500}>TRAZA OTDR · EJEMPLO</Label>
      <Label x={ox + ow} y={oy - 10} anchor="end">dB / km</Label>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={ox} x2={ox + ow} y1={oy + i * 33} y2={oy + i * 33} stroke={C.softer} />
      ))}
      <path d={trace} fill="none" stroke={C.ink} strokeWidth="1.4" />
      <circle cx={ox + 141} cy={oy + 44} r="3" fill="none" stroke={C.red} />
      <circle cx={ox + 254} cy={oy + 50} r="3" fill="none" stroke={C.red} />
      <circle cx={ox + 362} cy={oy + 66} r="3" fill="none" stroke={C.red} />
      <Label x={ox + 141} y={oy + 66} anchor="middle" size={8}>empalme</Label>
      <Label x={ox + 254} y={oy + 40} anchor="middle" size={8}>conector</Label>
      <Label x={ox + 362} y={oy + 56} anchor="middle" size={8}>fin</Label>
      {/* leyenda */}
      <g fontFamily={MONO} fontSize="9.5" fill={C.ink}>
        <text x="540" y="440">A  Distribuidor en site</text>
        <text x="540" y="458">B  Registro de paso</text>
        <text x="540" y="476">C  Trayectoria subterránea</text>
        <text x="540" y="494">D  Distribuidor en nave</text>
      </g>
    </PlateSvg>
  )
}

/* ---------- CCTV: planta de CEDIS con campos de visión ---------- */
export function CctvPlate() {
  return (
    <PlateSvg label="Planta de un centro de distribución con ubicación de cámaras y campos de visión en andenes, patio y perímetro" sheet="LÁM. SEG-01 · COBERTURA CCTV · S/E">
      {/* perímetro */}
      <rect x="30" y="30" width="740" height="500" fill="none" stroke={C.ink} strokeWidth="1" strokeDasharray="2 5" />
      <Label x="40" y="24">PERÍMETRO</Label>
      {/* almacén */}
      <rect x="90" y="70" width="470" height="270" fill={C.paper} stroke={C.ink} strokeWidth="1.6" />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={150 + i * 46} y="96" width="16" height="170" fill={C.softer} stroke={C.soft} />
      ))}
      <rect x="100" y="280" width="90" height="50" fill="#EAF3F9" stroke={C.red} strokeWidth="1" />
      <Label x="108" y="300" color={C.ink} size={9}>OFICINA</Label>
      <Label x="108" y="316" color={C.red} size={9} weight={500}>NVR</Label>
      <Label x="300" y="62" anchor="middle" color={C.ink} weight={500}>ALMACÉN</Label>
      {/* andenes */}
      {Array.from({ length: 6 }).map((_, i) => (
        <g key={i}>
          <rect x={220 + i * 56} y="336" width="34" height="8" fill={C.ink} />
          <rect x={222 + i * 56} y="356" width="30" height="96" fill={C.paper} stroke={C.line} />
        </g>
      ))}
      <Label x="200" y="474" color={C.ink} weight={500}>ANDENES</Label>
      <Label x="660" y="300" anchor="middle" color={C.ink} weight={500}>PATIO DE MANIOBRAS</Label>
      {/* caseta */}
      <rect x="680" y="452" width="44" height="34" fill={C.paper} stroke={C.ink} />
      <Label x="702" y="502" anchor="middle" size={9}>CASETA</Label>
      <line x1="724" y1="470" x2="770" y2="470" stroke={C.red} strokeWidth="3" />
      {/* cámaras */}
      <Camera x={560} y={340} dir={160} spread={60} r={170} />
      <Camera x={90} y={340} dir={-10} spread={50} r={130} />
      <Camera x={560} y={70} dir={135} spread={60} r={140} />
      <Camera x={90} y={70} dir={45} spread={60} r={140} />
      <Camera x={660} y={210} dir={0} ptz r={88} />
      <Camera x={700} y={452} dir={-120} spread={70} r={90} />
      <Camera x={40} y={520} dir={-45} spread={45} r={150} />
      <Camera x={760} y={40} dir={135} spread={45} r={150} />
      {/* leyenda */}
      <g transform="translate(600 70)">
        <rect width="150" height="78" fill={C.paper} stroke={C.soft} />
        <g transform="translate(16 20)"><rect x="-6" y="-4" width="12" height="8" fill={C.ink} /><rect x="6" y="-2.5" width="4" height="5" fill={C.red} /></g>
        <Label x="34" y="24" color={C.ink} size={9}>Cámara fija</Label>
        <circle cx="16" cy="42" r="6" fill={C.ink} />
        <Label x="34" y="45" color={C.ink} size={9}>PTZ</Label>
        <rect x="8" y="57" width="16" height="10" fill="rgba(23,111,176,0.09)" stroke="rgba(23,111,176,0.5)" />
        <Label x="34" y="66" color={C.ink} size={9}>Campo de visión</Label>
      </g>
    </PlateSvg>
  )
}

/* ---------- Cableado: planta de oficina con trayectorias ---------- */
export function CablingPlate() {
  const outlets: [number, number][] = [
    [190, 120], [260, 120], [330, 120], [430, 120], [510, 120], [600, 120], [680, 120],
    [190, 200], [330, 200], [510, 200], [680, 200],
    [190, 340], [300, 340], [420, 340], [540, 340], [660, 340],
    [240, 420], [420, 420], [600, 420],
  ]
  return (
    <PlateSvg label="Planta de oficina con charola en pasillo, site y trayectorias de cableado hacia cada nodo" sheet="LÁM. INF-03 · PLANTA DE NODOS · S/E">
      <rect x="50" y="60" width="700" height="420" fill={C.paper} stroke={C.ink} strokeWidth="2" />
      {/* muros */}
      <g stroke={C.ink} strokeWidth="1.4">
        <line x1="50" y1="240" x2="750" y2="240" />
        <line x1="50" y1="290" x2="750" y2="290" />
        <line x1="150" y1="60" x2="150" y2="240" />
        <line x1="400" y1="60" x2="400" y2="240" />
        <line x1="560" y1="60" x2="560" y2="160" />
        <line x1="360" y1="290" x2="360" y2="480" />
      </g>
      {/* site */}
      <rect x="56" y="66" width="88" height="170" fill="#EAF3F9" />
      <rect x="74" y="150" width="22" height="34" fill={C.ink} />
      <rect x="100" y="150" width="22" height="34" fill={C.ink2} />
      <Label x="98" y="132" anchor="middle" color={C.red} weight={500}>SITE</Label>
      {/* charola */}
      <g>
        <rect x="96" y="258" width="640" height="14" fill="none" stroke={C.ink2} strokeWidth="1" />
        {Array.from({ length: 40 }).map((_, i) => (
          <line key={i} x1={100 + i * 16} y1="258" x2={108 + i * 16} y2="272" stroke={C.line} strokeWidth="0.7" />
        ))}
        <line x1="96" y1="236" x2="96" y2="258" stroke={C.ink2} strokeWidth="1" />
        <Label x="740" y="252" anchor="end" size={9}>CHAROLA · PASILLO</Label>
      </g>
      {/* trayectorias */}
      <g fill="none" stroke={C.line} strokeWidth="0.9" strokeDasharray="3 3">
        {outlets.map(([x, y], i) => (
          <path key={i} d={y < 240 ? `M${x} 258 V${y + 6}` : `M${x} 272 V${y - 6}`} />
        ))}
      </g>
      <path d="M110 184 V265 H680 V200" fill="none" stroke={C.red} strokeWidth="2" />
      {/* nodos */}
      {outlets.map(([x, y], i) => (
        <path key={i} d={`M${x - 6} ${y + 5} L${x} ${y - 5} L${x + 6} ${y + 5} Z`} fill={i === 10 ? C.red : C.ink} />
      ))}
      {/* escritorios */}
      <g fill="none" stroke={C.soft}>
        {[170, 240, 310].map((x) => <rect key={x} x={x} y="150" width="50" height="26" />)}
        {[420, 490].map((x) => <rect key={x} x={x} y="170" width="56" height="28" />)}
        {[170, 290, 410, 530, 640].map((x) => <rect key={x} x={x} y="370" width="56" height="28" />)}
      </g>
      {/* cota */}
      <g>
        <line x1="110" x2="680" y1="510" y2="510" stroke={C.ink} strokeWidth="0.8" />
        <line x1="110" x2="110" y1="502" y2="518" stroke={C.ink} strokeWidth="0.8" />
        <line x1="680" x2="680" y1="502" y2="518" stroke={C.ink} strokeWidth="0.8" />
        <rect x="290" y="502" width="210" height="16" fill={C.bg} />
        <Label x="395" y="514" anchor="middle" color={C.red} weight={500}>ENLACE PERMANENTE ≤ 90 m</Label>
      </g>
      <Callout x={680} y={200} tx={705} ty={180} letter="N" text="" />
      <Label x="60" y="50" color={C.ink} weight={500}>NIVEL 1 · OFICINAS</Label>
    </PlateSvg>
  )
}

/* ---------- WiFi: mapa de cobertura ---------- */
export function WifiPlate() {
  const aps: [number, number][] = [[180, 150], [400, 150], [620, 150], [180, 370], [400, 370], [620, 370]]
  return (
    <PlateSvg label="Planta con ubicación de access points y mapa de cobertura inalámbrica de ejemplo" sheet="LÁM. CON-01 · DISEÑO DE COBERTURA · S/E">
      <defs>
        <radialGradient id="wifiHeat">
          <stop offset="0" stopColor="#176FB0" stopOpacity="0.32" />
          <stop offset="0.45" stopColor="#176FB0" stopOpacity="0.14" />
          <stop offset="1" stopColor="#176FB0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="60" y="50" width="680" height="430" fill={C.paper} stroke={C.ink} strokeWidth="2" />
      {Array.from({ length: 5 }).map((_, i) => (
        <rect key={i} x={110 + i * 130} y="240" width="70" height="30" fill={C.softer} stroke={C.soft} />
      ))}
      {[180, 310, 440, 570].map((x) => <rect key={x} x={x} y="60" width="8" height="8" fill={C.ink} />)}
      {aps.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="150" fill="url(#wifiHeat)" />
      ))}
      {aps.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="11" fill={C.paper} stroke={C.ink} strokeWidth="1.4" />
          <text x={x} y={y + 3.2} textAnchor="middle" fontFamily={MONO} fontSize="8" fill={C.ink} fontWeight="500">AP</text>
          <path d={`M${x - 18} ${y - 14} q 18 -14 36 0`} fill="none" stroke={C.red} strokeWidth="1" />
          <Label x={x + 16} y={y + 24} size={8}>{`AP-0${i + 1}`}</Label>
        </g>
      ))}
      <g transform="translate(560 500)">
        <rect x="0" y="-10" width="60" height="8" fill="rgba(23,111,176,0.32)" />
        <rect x="60" y="-10" width="60" height="8" fill="rgba(23,111,176,0.14)" />
        <rect x="120" y="-10" width="60" height="8" fill="rgba(23,111,176,0.04)" stroke={C.soft} />
        <Label x="0" y="12" size={8}>alta</Label>
        <Label x="180" y="12" anchor="end" size={8}>baja</Label>
      </g>
      <Label x="60" y="40" color={C.ink} weight={500}>MAPA DE CALOR · EJEMPLO</Label>
    </PlateSvg>
  )
}

/* ---------- Control de acceso: esquema de puerta ---------- */
export function AccessPlate() {
  return (
    <PlateSvg label="Esquema de una puerta con lector, cerradura, botón de salida y sensor conectados a una controladora en red" sheet="LÁM. SEG-02 · PUERTA CONTROLADA · S/E">
      {/* muro y puerta */}
      <rect x="80" y="80" width="300" height="380" fill={C.paper} stroke={C.ink} strokeWidth="1.4" />
      <rect x="150" y="130" width="150" height="330" fill={C.softer} stroke={C.ink} strokeWidth="1.4" />
      <rect x="276" y="290" width="14" height="4" fill={C.ink} />
      <line x1="150" y1="460" x2="80" y2="460" stroke={C.ink} />
      {/* cerradura */}
      <rect x="180" y="118" width="90" height="12" fill={C.ink} />
      {/* lector */}
      <rect x="318" y="270" width="26" height="40" rx="3" fill={C.ink} />
      <rect x="324" y="278" width="14" height="10" fill={C.red} />
      {/* botón salida */}
      <rect x="104" y="280" width="22" height="22" fill={C.paper} stroke={C.ink} />
      <circle cx="115" cy="291" r="6" fill={C.red} />
      {/* sensor */}
      <rect x="292" y="140" width="12" height="18" fill={C.ink2} />
      {/* controladora */}
      <rect x="470" y="200" width="120" height="120" fill={C.paper} stroke={C.ink} strokeWidth="1.4" />
      {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={484 + i * 16} y="290" width="10" height="16" fill={C.ink2} />)}
      <Label x="530" y="230" anchor="middle" color={C.ink} weight={500}>CONTROLADORA</Label>
      {/* switch y software */}
      <rect x="640" y="226" width="120" height="22" fill={C.ink} />
      <Label x="700" y="270" anchor="middle">SWITCH · RED</Label>
      <rect x="640" y="360" width="120" height="80" fill={C.paper} stroke={C.ink} />
      <line x1="652" y1="380" x2="740" y2="380" stroke={C.soft} strokeWidth="4" />
      <line x1="652" y1="396" x2="720" y2="396" stroke={C.soft} strokeWidth="4" />
      <line x1="652" y1="412" x2="730" y2="412" stroke={C.red} strokeWidth="4" />
      <Label x="700" y="460" anchor="middle">PERMISOS · REPORTES</Label>
      {/* cableado */}
      <g fill="none" stroke={C.red} strokeWidth="1.3">
        <path d="M344 290 H420 V240 H470" />
        <path d="M270 124 H430 V220 H470" />
        <path d="M304 150 H410 V260 H470" />
        <path d="M115 302 V500 H440 V300 H470" />
      </g>
      <path d="M590 237 H640" stroke={C.ink} strokeWidth="1.4" />
      <path d="M700 248 V360" stroke={C.ink} strokeWidth="1.4" strokeDasharray="4 3" />
      <Callout x={331} y={275} tx={360} ty={190} letter="1" text="Lector" />
      <Callout x={225} y={118} tx={225} ty={60} letter="2" text="Cerradura" />
      <Callout x={115} y={280} tx={60} ty={240} letter="3" text="" />
      <Callout x={298} y={150} tx={420} ty={120} letter="4" text="Sensor de puerta" />
      <Label x="40" y="530">3 · BOTÓN DE SALIDA</Label>
    </PlateSvg>
  )
}

/* ---------- Site: planta del cuarto de telecomunicaciones ---------- */
export function SitePlate() {
  return (
    <PlateSvg label="Planta de un cuarto de telecomunicaciones con fila de racks, escalerilla, UPS y área de trabajo" sheet="LÁM. INF-04 · PLANTA DE SITE · S/E">
      <rect x="120" y="70" width="560" height="400" fill={C.paper} stroke={C.ink} strokeWidth="3" />
      <path d="M120 400 A70 70 0 0 1 190 470" fill="none" stroke={C.line} />
      <line x1="120" y1="400" x2="190" y2="400" stroke={C.ink} strokeWidth="2" />
      {/* escalerilla */}
      <g>
        <rect x="200" y="120" width="420" height="22" fill="none" stroke={C.ink2} />
        {Array.from({ length: 22 }).map((_, i) => <line key={i} x1={206 + i * 19} x2={206 + i * 19} y1="120" y2="142" stroke={C.line} />)}
        <Label x="620" y="112" anchor="end" size={9}>ESCALERILLA</Label>
      </g>
      {/* racks */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={230 + i * 92} y="160" width="80" height="80" fill={i === 1 ? '#EAF3F9' : C.softer} stroke={i === 1 ? C.red : C.ink} strokeWidth="1.4" />
          <line x1={230 + i * 92} x2={310 + i * 92} y1="236" y2="236" stroke={C.ink} strokeWidth="3" />
          <Label x={270 + i * 92} y="205" anchor="middle" size={9} color={C.ink}>{`R-0${i + 1}`}</Label>
        </g>
      ))}
      {/* área de trabajo */}
      <rect x="230" y="250" width="356" height="100" fill="rgba(23,111,176,0.05)" stroke="rgba(23,111,176,0.4)" strokeDasharray="5 4" />
      <Label x="408" y="304" anchor="middle" color={C.red}>FRENTE DE TRABAJO</Label>
      {/* UPS y tierra */}
      <rect x="600" y="380" width="64" height="74" fill={C.ink} />
      <Label x="632" y="372" anchor="middle" size={9}>UPS</Label>
      <rect x="136" y="200" width="10" height="70" fill={C.ink2} />
      <Label x="150" y="288" size={9}>TIERRA</Label>
      <rect x="660" y="150" width="14" height="110" fill={C.softer} stroke={C.ink} />
      <Label x="700" y="210" size={9}>A/A</Label>
      <Callout x={362} y={200} tx={362} ty={40} letter="R" text="Fila de racks" />
      <Label x="120" y="500" color={C.ink} weight={500}>SITE · CUARTO DE TELECOMUNICACIONES</Label>
    </PlateSvg>
  )
}

/* ---------- Ingeniería: hoja de plano con cajetín ---------- */
export function EngineeringPlate() {
  return (
    <PlateSvg label="Hoja de plano de ingeniería con diagrama de red y cajetín de datos" sheet="LÁM. ING-01 · PROYECTO EJECUTIVO">
      <rect x="40" y="36" width="720" height="488" fill={C.paper} stroke={C.ink} strokeWidth="1.6" />
      <rect x="52" y="48" width="696" height="464" fill="none" stroke={C.ink} strokeWidth="0.6" />
      {/* diagrama */}
      <g stroke={C.ink} strokeWidth="1.2" fill={C.paper}>
        <rect x="110" y="110" width="90" height="40" />
        <rect x="290" y="110" width="110" height="40" fill={C.ink} />
        <rect x="490" y="80" width="100" height="36" />
        <rect x="490" y="150" width="100" height="36" />
        <rect x="290" y="250" width="110" height="36" />
      </g>
      <g fill="none" strokeWidth="1.3">
        <path d="M200 130 H290" stroke={C.ink} />
        <path d="M400 125 H450 V98 H490" stroke={C.red} strokeWidth="2" />
        <path d="M400 135 H450 V168 H490" stroke={C.red} strokeWidth="2" />
        <path d="M345 150 V250" stroke={C.ink} />
      </g>
      <Label x="155" y="134" anchor="middle" color={C.ink} size={9}>FW</Label>
      <Label x="345" y="134" anchor="middle" color="#fff" size={9}>NÚCLEO</Label>
      <Label x="540" y="102" anchor="middle" color={C.ink} size={9}>IDF-A</Label>
      <Label x="540" y="172" anchor="middle" color={C.ink} size={9}>IDF-B</Label>
      <Label x="345" y="272" anchor="middle" color={C.ink} size={9}>NVR</Label>
      <Label x="450" y="76" color={C.red} size={8}>OS2</Label>
      {/* notas */}
      <g fontFamily={MONO} fontSize="9" fill={C.muted}>
        <text x="80" y="340">NOTAS GENERALES</text>
        <text x="80" y="360">1. TRAYECTORIAS SEGÚN LEVANTAMIENTO EN SITIO.</text>
        <text x="80" y="376">2. ETIQUETADO EN AMBOS EXTREMOS DE CADA ENLACE.</text>
        <text x="80" y="392">3. CERTIFICACIÓN DE CADA PUNTO CON REPORTE.</text>
      </g>
      {/* cajetín */}
      <g>
        <rect x="470" y="380" width="278" height="132" fill="none" stroke={C.ink} />
        <line x1="470" y1="412" x2="748" y2="412" stroke={C.ink} strokeWidth="0.6" />
        <line x1="470" y1="444" x2="748" y2="444" stroke={C.ink} strokeWidth="0.6" />
        <line x1="470" y1="476" x2="748" y2="476" stroke={C.ink} strokeWidth="0.6" />
        <line x1="610" y1="444" x2="610" y2="512" stroke={C.ink} strokeWidth="0.6" />
        <text x="482" y="402" fontFamily="Archivo, Arial, sans-serif" fontSize="15" fontWeight="700" fill={C.ink}>interfaz<tspan fill={C.red}>.</tspan></text>
        <Label x="736" y="401" anchor="end" size={8}>REDES Y TELECOMUNICACIONES</Label>
        <Label x="482" y="432" color={C.ink} size={9}>PROYECTO · DIAGRAMA GENERAL DE RED</Label>
        <Label x="482" y="464" size={8}>LÁMINA</Label>
        <Label x="560" y="464" color={C.ink} size={9}>ING-01</Label>
        <Label x="622" y="464" size={8}>ESCALA</Label>
        <Label x="736" y="464" anchor="end" color={C.ink} size={9}>S/E</Label>
        <Label x="482" y="497" size={8}>REVISIÓN</Label>
        <Label x="560" y="497" color={C.red} size={9}>R0</Label>
        <Label x="622" y="497" size={8}>FECHA</Label>
        <Label x="736" y="497" anchor="end" color={C.ink} size={9}>—</Label>
      </g>
    </PlateSvg>
  )
}
