import type { PlateKind } from '../../data/solutions'
import { IMG, type ImgKey } from '../../data/media'
import { cn } from '../../lib/utils'
import { RackElevation } from './RackPlate'
import { AccessPlate, CablingPlate, CctvPlate, EngineeringPlate, FiberPlate, SitePlate, WifiPlate } from './Plates'

export function Plate({ kind }: { kind: PlateKind }) {
  switch (kind) {
    case 'rack': return <RackElevation showCallouts={false} viewBox="170 26 460 512" fit="meet" sheet="" />
    case 'fiber': return <FiberPlate />
    case 'cctv': return <CctvPlate />
    case 'cabling': return <CablingPlate />
    case 'wifi': return <WifiPlate />
    case 'access': return <AccessPlate />
    case 'site': return <SitePlate />
    case 'engineering': return <EngineeringPlate />
  }
}

/** Espacio de imagen. Usa la visualización si existe; si no, la lámina técnica. */
export function Media({ img, plate, className, ratio = 'aspect-[16/10]', zoom = false, pos, caption }: {
  img?: ImgKey
  plate: PlateKind
  className?: string
  ratio?: string
  tag?: boolean
  zoom?: boolean
  eager?: boolean
  pos?: string
  caption?: string
}) {
  const m = img ? IMG[img] : null
  return (
    <figure className={cn('relative overflow-hidden bg-mist', ratio, className)}>
      {m ? (
        <img src={m.src} alt={m.alt} decoding="async" className={cn('absolute inset-0 h-full w-full object-cover', zoom && 'img-zoom')} style={{ objectPosition: pos ?? m.pos }} />
      ) : (
        <div className="absolute inset-0 bg-[#F1F5F8]"><Plate kind={plate} /></div>
      )}
      {caption && <figcaption className="absolute bottom-3 right-4 text-[0.72rem] text-white/70 [text-shadow:0_1px_2px_rgba(0,0,0,.4)]">{caption}</figcaption>}
    </figure>
  )
}
