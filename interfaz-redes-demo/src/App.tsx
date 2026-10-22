import { BrowserRouter, HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { LanguageSuggestion } from './components/layout/LanguageSelector'
import { WhatsAppButton } from './components/layout/WhatsAppButton'
import { Button } from './components/ui'
import { I18nProvider, useT, type Messages } from './i18n'
import { LOCALE_META, LOCALES, splitLocale } from './i18n/config'
import { useContactClicks, usePageViews } from './lib/analytics'
import { useSeo } from './lib/seo'
import { useScrollToTop } from './lib/utils'
import { LazyMotion, MotionConfig, type FeatureBundle } from 'motion/react'
import { Component, lazy, startTransition, Suspense, useEffect, useState, type ReactNode } from 'react'
import Home from './pages/Home'

// Las páginas interiores se cargan bajo demanda para que el inicio sea más ligero.
const load = {
  about: () => import('./pages/About'),
  contact: () => import('./pages/Contact'),
  explorer: () => import('./pages/Explorer'),
  industries: () => import('./pages/Industries'),
  industry: () => import('./pages/IndustryDetail'),
  projects: () => import('./pages/Projects'),
  resources: () => import('./pages/Resources'),
  service: () => import('./pages/ServiceDetail'),
  privacy: () => import('./pages/Privacy'),
  solutions: () => import('./pages/Solutions'),
}
const About = lazy(load.about)
const Contact = lazy(load.contact)
const Explorer = lazy(load.explorer)
const Industries = lazy(load.industries)
const IndustryDetail = lazy(load.industry)
const Projects = lazy(() => load.projects().then((m) => ({ default: m.Projects })))
const ProjectDetail = lazy(() => load.projects().then((m) => ({ default: m.ProjectDetail })))
const Resources = lazy(() => load.resources().then((m) => ({ default: m.Resources })))
const Article = lazy(() => load.resources().then((m) => ({ default: m.Article })))
const ServiceDetail = lazy(load.service)
const Privacy = lazy(load.privacy)
const Solutions = lazy(load.solutions)

const LOAD_BY_PATH: Record<string, () => Promise<unknown>> = {
  '/soluciones': load.solutions,
  '/industrias': load.industries,
  '/proyectos': load.projects,
  '/explorador': load.explorer,
  '/recursos': load.resources,
  '/nosotros': load.about,
  '/contacto': load.contact,
  '/aviso-de-privacidad': load.privacy,
}
const PREFIX_LOADERS: [string, () => Promise<unknown>][] = [['/soluciones/', load.service], ['/industrias/', load.industry], ['/proyectos/', load.projects], ['/recursos/', load.resources]]
const loaderFor = (pathname: string) => {
  const { path } = splitLocale(pathname)
  return PREFIX_LOADERS.find(([p]) => path.startsWith(p))?.[1] ?? LOAD_BY_PATH[path]
}

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

/** Mientras llegan las funciones de animación: una carga que nunca termina (LazyMotion espera sin animar). */
const featuresPending = () => new Promise<FeatureBundle>(() => {})

/**
 * Las funciones de animación se descargan aparte y se activan como transición (startTransition). Si llegan
 * mientras React todavía está tomando el HTML prerenderizado de una sección que se carga bajo demanda, React
 * espera a terminar en lugar de descartar ese HTML y volver a dibujarla (error 421 con una red lenta).
 */
function MotionFeatures({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<FeatureBundle | null>(null)
  useEffect(() => {
    let live = true
    import('./lib/motion-features').then((m) => { if (live) startTransition(() => setFeatures(m.default)) })
    return () => { live = false }
  }, [])
  return <LazyMotion features={features ?? featuresPending}>{children}</LazyMotion>
}

function NotFound() {
  const t = useT()
  useSeo(t.seo.notFound, { noindex: true })
  return (
    <section className="container py-32">
      <p className="text-small font-medium text-corp">{t.notFound.code}</p>
      <h1 className="mt-4 text-h1">{t.notFound.title}</h1>
      <p className="mt-4 text-muted">{t.notFound.text}</p>
      <div className="mt-8 flex gap-3"><Button to="/">{t.notFound.home}</Button><Button to="/soluciones" variant="secondary">{t.notFound.solutions}</Button></div>
    </section>
  )
}

/**
 * Si una sección no carga (archivo de una versión anterior del sitio o corte de red), muestra un aviso con
 * botón para recargar en lugar de dejar la pantalla en blanco. Se reinicia al cambiar de página.
 */
class SectionBoundary extends Component<{ children: ReactNode; t: Messages }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (!this.state.failed) return this.props.children
    const T = this.props.t.sectionError
    return (
      <section className="container py-32">
        <p className="text-small font-medium text-corp">{T.code}</p>
        <h1 className="mt-4 text-h1">{T.title}</h1>
        <p className="mt-4 text-muted">{T.text}</p>
        <div className="mt-8 flex gap-3"><Button onClick={() => window.location.reload()}>{T.reload}</Button><Button to="/" variant="secondary">{T.home}</Button></div>
      </section>
    )
  }
}

/** Las mismas rutas en cada idioma: /soluciones, /en/soluciones, /ko/soluciones, /zh-CN/soluciones. */
const localeRoutes = (prefix: string) => (
  <Route key={prefix || 'es'} path={prefix || '/'}>
    <Route index element={<Home />} />
    <Route path="soluciones" element={<Solutions />} />
    <Route path="soluciones/:slug" element={<ServiceDetail />} />
    <Route path="industrias" element={<Industries />} />
    <Route path="industrias/:id" element={<IndustryDetail />} />
    <Route path="proyectos" element={<Projects />} />
    <Route path="proyectos/:slug" element={<ProjectDetail />} />
    <Route path="explorador" element={<Explorer />} />
    <Route path="recursos" element={<Resources />} />
    <Route path="recursos/:slug" element={<Article />} />
    <Route path="nosotros" element={<About />} />
    <Route path="contacto" element={<Contact />} />
    <Route path="aviso-de-privacidad" element={<Privacy />} />
    <Route path="*" element={<NotFound />} />
  </Route>
)

function Layout() {
  const { pathname } = useLocation()
  const t = useT()
  useScrollToTop()
  usePrefetchOnIntent()
  usePageViews()
  useContactClicks()
  return (
    // Con «reducir movimiento» en el sistema, los desplazamientos y cambios de tamaño animados se omiten.
    <MotionConfig reducedMotion="user">
    <MotionFeatures>
      <a href="#contenido" onClick={(e) => { e.preventDefault(); document.getElementById('contenido')?.focus() }} className="sr-only z-[60] bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">{t.common.skipToContent}</a>
      <Header />
      <main id="contenido" tabIndex={-1} className="outline-none">
        {/* Ocupa al menos la pantalla mientras carga la página, para que el footer no brinque al llegar el contenido. */}
        <SectionBoundary key={pathname} t={t}>
        <div className="page-enter">
        <Suspense fallback={<div className="min-h-[100svh]" aria-busy="true" />}>
        <Routes>{LOCALES.map((l) => localeRoutes(LOCALE_META[l].prefix))}</Routes>
        </Suspense>
        </div>
        </SectionBoundary>
      </main>
      <Footer />
      <WhatsAppButton />
      <LanguageSuggestion />
    </MotionFeatures>
    </MotionConfig>
  )
}

/** El sitio sin el router: App lo envuelve en el del navegador y src/entry-server.tsx en uno estático (prerender). */
export function Shell() {
  return (
    // Sólo suspende si se vuelve con «Atrás» a una página en un idioma que aún no se descargó.
    <Suspense fallback={<div className="min-h-[100svh]" aria-busy="true" />}>
      <I18nProvider>
        <Layout />
      </I18nProvider>
    </Suspense>
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
