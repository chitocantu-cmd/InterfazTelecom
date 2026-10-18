import { BrowserRouter, HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { WhatsAppButton } from './components/layout/WhatsAppButton'
import { Button } from './components/ui'
import { useContactClicks, usePageViews } from './lib/analytics'
import { SEO } from './data/seo'
import { useSeo } from './lib/seo'
import { useScrollToTop } from './lib/utils'
import { MotionConfig } from 'motion/react'
import { Component, lazy, Suspense, type ReactNode } from 'react'
import Home from './pages/Home'

// Las páginas interiores se cargan bajo demanda para que el inicio sea más ligero.
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Industries = lazy(() => import('./pages/Industries'))
const Projects = lazy(() => import('./pages/Projects').then((m) => ({ default: m.Projects })))
const ProjectDetail = lazy(() => import('./pages/Projects').then((m) => ({ default: m.ProjectDetail })))
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Solutions = lazy(() => import('./pages/Solutions'))

function NotFound() {
  useSeo(SEO.notFound, { noindex: true })
  return (
    <section className="container py-32">
      <p className="text-small font-medium text-corp">Error 404</p>
      <h1 className="mt-4 text-h1">Esta página no existe.</h1>
      <p className="mt-4 text-slate-muted">Puede volver al inicio o revisar el índice de soluciones.</p>
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
        <p className="mt-4 text-slate-muted">Puede deberse a una actualización reciente del sitio o a la conexión. Recargue la página para continuar.</p>
        <div className="mt-8 flex gap-3"><Button onClick={() => window.location.reload()}>Recargar</Button><Button to="/" variant="secondary">Ir al inicio</Button></div>
      </section>
    )
  }
}

/** El sitio sin el router: App lo envuelve en el del navegador y src/entry-server.tsx en uno estático (prerender). */
export function Shell() {
  const { pathname } = useLocation()
  useScrollToTop()
  usePageViews()
  useContactClicks()
  return (
    // Con «reducir movimiento» en el sistema, los desplazamientos y cambios de tamaño animados se omiten.
    <MotionConfig reducedMotion="user">
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
