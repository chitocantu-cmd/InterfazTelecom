import { Explorer } from '../components/home/Explorer'
import { Hero } from '../components/home/Hero'
import { FeaturedProjects, FieldGallery, FinalCTA, IndustriesIndex, Intro, NeedsExplorer, ProcessLine } from '../components/home/Sections'
import { useSeo } from '../lib/seo'
import { SEO } from '../data/seo'

export default function Home() {
  useSeo(SEO.home)
  return (
    <>
      <Hero />
      <Intro />
      <FieldGallery
        lede="Instalaciones del equipo técnico de Interfaz: tendido de cable, organización de racks y trabajo en cuartos de telecomunicaciones."
        items={[
          { img: 'rackTecnico', caption: 'Trabajo en rack de comunicaciones' },
          { img: 'plafon', caption: 'Tendido de cable por plafón' },
          { img: 'patchPanel', caption: 'Organización de cableado en rack' },
          { img: 'pasillo', caption: 'Tendido de cable UTP en oficinas' },
        ]}
      />
      <Explorer />
      <FeaturedProjects />
      <NeedsExplorer />
      <IndustriesIndex />
      <ProcessLine />
      <FinalCTA />
    </>
  )
}
