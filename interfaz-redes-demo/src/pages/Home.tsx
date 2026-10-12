import { Explorer } from '../components/home/Explorer'
import { Hero } from '../components/home/Hero'
import { FeaturedProjects, FinalCTA, IndustriesIndex, Intro, NeedsExplorer, ProcessLine } from '../components/home/Sections'
import { useSeo } from '../lib/seo'

export default function Home() {
  useSeo('Interfaz Redes · Redes, telecomunicaciones y seguridad electrónica en Monterrey', 'Ingeniería, instalación y mantenimiento de cableado estructurado, fibra óptica, redes, CCTV y control de acceso para empresas e industria en Monterrey, N.L.')
  return (
    <>
      <Hero />
      <Intro />
      <Explorer />
      <FeaturedProjects />
      <NeedsExplorer />
      <IndustriesIndex />
      <ProcessLine />
      <FinalCTA />
    </>
  )
}
