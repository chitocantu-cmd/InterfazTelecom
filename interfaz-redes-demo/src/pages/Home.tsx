import { Explorer } from '../components/home/Explorer'
import { FlowDiagram } from '../components/home/FlowDiagram'
import { Hero } from '../components/home/Hero'
import { ExplorerTeaser, FeaturedProjects, FieldGallery, FinalCTA, IndustriesIndex, Intro, ProcessLine } from '../components/home/Sections'
import { useT } from '../i18n'
import { useSeo } from '../lib/seo'

export default function Home() {
  const t = useT()
  useSeo(t.seo.home)
  return (
    <>
      <Hero />
      <Intro />
      <FieldGallery lede={t.field.homeLede} items={['rackTecnico', 'plafon', 'patchPanel', 'pasillo']} />
      <Explorer />
      <FlowDiagram />
      <ExplorerTeaser />
      <IndustriesIndex />
      <FeaturedProjects />
      <ProcessLine />
      <FinalCTA />
    </>
  )
}
