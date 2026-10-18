import type { PlateKind } from '../../data/solutions'
import { RackElevation } from './RackPlate'
import { AccessPlate, CablingPlate, CctvPlate, EngineeringPlate, FiberPlate, SitePlate, WifiPlate } from './Plates'

/** Lámina técnica del tipo indicado (la carga Media bajo demanda). */
export default function Plate({ kind }: { kind: PlateKind }) {
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
