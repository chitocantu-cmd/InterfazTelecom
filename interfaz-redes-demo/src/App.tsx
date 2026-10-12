import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { Button } from './components/ui'
import { useContactClicks, usePageViews } from './lib/analytics'
import { useSeo } from './lib/seo'
import { useScrollToTop } from './lib/utils'
import { lazy, Suspense } from 'react'
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
  useSeo('Página no encontrada', 'La página que busca no existe. Revise el índice de soluciones de Interfaz Redes.')
  return (
    <section className="container py-32">
      <p className="text-small font-medium text-corp">Error 404</p>
      <h1 className="mt-4 text-h1">Esta página no existe.</h1>
      <p className="mt-4 text-slate-muted">Puede volver al inicio o revisar el índice de soluciones.</p>
      <div className="mt-8 flex gap-3"><Button to="/">Ir al inicio</Button><Button to="/soluciones" variant="secondary">Ver soluciones</Button></div>
    </section>
  )
}

function Shell() {
  useScrollToTop()
  usePageViews()
  useContactClicks()
  return (
    <>
      <a href="#contenido" onClick={(e) => { e.preventDefault(); document.getElementById('contenido')?.focus() }} className="sr-only z-[60] bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Saltar al contenido</a>
      <Header />
      <main id="contenido" tabIndex={-1} className="outline-none">
        <Suspense fallback={<div className="min-h-[70vh]" aria-busy="true" />}>
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
      </main>
      <Footer />
    </>
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
