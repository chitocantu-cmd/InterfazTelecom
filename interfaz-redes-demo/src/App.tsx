import { BrowserRouter, HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { WhatsAppButton } from './components/layout/WhatsAppButton'
import { Button } from './components/ui'
import { useContactClicks, usePageViews } from './lib/analytics'
import { SEO } from './data/seo'
import { useSeo } from './lib/seo'
import { useScrollToTop } from './lib/utils'
import { LazyMotion, MotionConfig } from 'motion/react'
import { Component, lazy, Suspense, useEffect, type ReactNode } from 'react'
import Home from './pages/Home'

// Las páginas interiores se cargan bajo demanda para que el inicio sea más ligero.
const load = {
  about: () => import('./pages/About'),
  contact: () => import('./pages/Contact'),
  industries: () => import('./pages/Industries'),
  projects: () => import('./pages/Projects'),
  service: () => import('./pages/ServiceDetail'),
  privacy: () => import('./pages/Privacy'),
  solutions: () => import('./pages/Solutions'),
}
const About = lazy(load.about)
const Contact = lazy(load.contact)
const Industries = lazy(load.industries)
const Projects = lazy(() => load.projects().then((m) => ({ default: m.Projects })))
const ProjectDetail = lazy(() => load.projects().then((m) => ({ default: m.ProjectDetail })))
const ServiceDetail = lazy(load.service)
const Privacy = lazy(load.privacy)
const Solutions = lazy(load.solutions)

const LOAD_BY_PATH: Record<string, () => Promise<unknown>> = {
  '/soluciones': load.solutions,
  '/industrias': load.industries,
  '/proyectos': load.projects,
  '/nosotros': load.about,
  '/contacto': load.contact,
  '/aviso-de-privacidad': load.privacy,
}
const loaderFor = (path: string) =>
  path.startsWith('/soluciones/') ? load.service : path.startsWith('/proyectos/') ? load.projects : LOAD_BY_PATH[path]

/**
 * Al apuntar o enfocar un enlace interno se adelanta la descarga de esa página, para que al hacer clic llegue sin
 * el hueco de carga. Sólo con intención de navegar: no gasta datos en páginas que no se visitan.
 */
function usePrefetchOnIntent() {
  useEffect(() => {
    const started = new Set<() => Promise<unknown>>()
    const onIntent = (e: Event) => {
      const link = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href^="/"]') : null
      const loader = link && loaderFor(link.pathname)
      if (!loader || started.has(loader)) return
      started.add(loader)
      loader().catch(() => started.delete(loader))
    }
    document.addEventListener('pointerover', onIntent, { passive: true })
    document.addEventListener('focusin', onIntent)
    return () => {
      document.removeEventListener('pointerover', onIntent)
      document.removeEventListener('focusin', onIntent)
    }
  }, [])
}

const motionFeatures = () => import('./lib/motion-features').then((m) => m.default)

function NotFound() {
  useSeo(SEO.notFound, { noindex: true })
  return (
    <section className="container py-32">
      <p className="text-small font-medium text-corp">Error 404</p>
      <h1 className="mt-4 text-h1">Esta página no existe.</h1>
      <p className="mt-4 text-muted">Puede volver al inicio o revisar el índice de soluciones.</p>
      <div className="mt-8 flex gap-3"><Button to="/">Ir al inicio</Button><Button to="/soluciones" variant="secondary">Ver soluciones</Button></div>
    </section>
  )
}

/**
 * Si una sección no carga (archivo de una versión anterior del sitio o corte de red), muestra un aviso con
 * botón para recargar en lugar de dejar la pantalla en blanco. Se reinicia al cambiar de página.
 */
class SectionBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <section className="container py-32">
        <p className="text-small font-medium text-corp">Error de carga</p>
        <h1 className="mt-4 text-h1">No se pudo cargar esta sección.</h1>
        <p className="mt-4 text-muted">Puede deberse a una actualización reciente del sitio o a la conexión. Recargue la página para continuar.</p>
        <div className="mt-8 flex gap-3"><Button onClick={() => window.location.reload()}>Recargar</Button><Button to="/" variant="secondary">Ir al inicio</Button></div>
      </section>
    )
  }
}

/** El sitio sin el router: App lo envuelve en el del navegador y src/entry-server.tsx en uno estático (prerender). */
export function Shell() {
  const { pathname } = useLocation()
  useScrollToTop()
  usePrefetchOnIntent()
  usePageViews()
  useContactClicks()
  return (
    // Con «reducir movimiento» en el sistema, los desplazamientos y cambios de tamaño animados se omiten.
    <MotionConfig reducedMotion="user">
    <LazyMotion features={motionFeatures}>
      <a href="#contenido" onClick={(e) => { e.preventDefault(); document.getElementById('contenido')?.focus() }} className="sr-only z-[60] bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Saltar al contenido</a>
      <Header />
      <main id="contenido" tabIndex={-1} className="outline-none">
        {/* Ocupa al menos la pantalla mientras carga la página, para que el footer no brinque al llegar el contenido. */}
        <SectionBoundary key={pathname}>
        <Suspense fallback={<div className="min-h-[100svh]" aria-busy="true" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/soluciones" element={<Solutions />} />
          <Route path="/soluciones/:slug" element={<ServiceDetail />} />
          <Route path="/industrias" element={<Industries />} />
          <Route path="/proyectos" element={<Projects />} />
          <Route path="/proyectos/:slug" element={<ProjectDetail />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/aviso-de-privacidad" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        </SectionBoundary>
      </main>
      <Footer />
      <WhatsAppButton />
    </LazyMotion>
    </MotionConfig>
  )
}

// Producción usa rutas limpias (/soluciones/fibra-optica). La vista previa de un solo
// archivo usa rutas con # porque no hay servidor que resuelva las URLs.
const Router = import.meta.env.VITE_ROUTER === 'hash' ? HashRouter : BrowserRouter

export default function App() {
  return (
    <Router>
      <Shell />
    </Router>
  )
}
