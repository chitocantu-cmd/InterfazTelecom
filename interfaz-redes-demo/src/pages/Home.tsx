import { Hero } from '../components/home/Hero'
import { Journey } from '../components/home/Journey'
import { RackExplorer } from '../components/home/RackExplorer'
import { ServicesStage } from '../components/home/ServicesStage'
import { ExplorerTeaser, FeaturedProjects, FieldGallery, FinalCTA, IndustriesIndex, Intro, ProcessLine } from '../components/home/Sections'
import { useT } from '../i18n'
import { useSeo } from '../lib/seo'

export default function Home() {
  const t = useT()
  useSeo(t.seo.home)
  return (
    <>
      <Hero />
      <Journey />
      <Intro />
      <FieldGallery lede={t.field.homeLede} items={['rackTecnico', 'plafon', 'patchPanel', 'pasillo']} />
      <ServicesStage />
      <RackExplorer />
      <IndustriesIndex />
      <ExplorerTeaser />
      <FeaturedProjects />
      <ProcessLine />
      <FinalCTA />
    </>
  )
}
