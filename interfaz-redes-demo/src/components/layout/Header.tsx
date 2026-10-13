import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronDown, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { COMPANY } from '../../data/company'
import { CATEGORIES, servicesOf } from '../../data/solutions'
import { cn, waLink } from '../../lib/utils'
import { Button } from '../ui'
import { Logo, LogoLockup } from './Logo'

export { Logo }

const NAV = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/soluciones', label: 'Soluciones', mega: true },
  { to: '/industrias', label: 'Industrias' },
  { to: '/proyectos', label: 'Proyectos' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mega, setMega] = useState(false)
  const [mobile, setMobile] = useState(false)
  const location = useLocation()
  const closeTimer = useRef<number>()
  const megaBtn = useRef<HTMLButtonElement>(null)
  const firstLink = useRef<HTMLAnchorElement>(null)
  const hoverOpened = useRef(false) // el menú lo abrió el cursor y aún no hay clic
  const reduce = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => { setMega(false); setMobile(false); hoverOpened.current = false }, [location.pathname, location.search])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (mega) megaBtn.current?.focus()
      setMega(false); setMobile(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mega])
  useEffect(() => { document.body.style.overflow = mobile ? 'hidden' : '' }, [mobile])

  // Con mouse el menú abre al pasar el cursor, y el clic que suele seguir no debe cerrarlo.
  // Con toque o teclado el clic abre y cierra (en pantallas táctiles no hay "pasar el cursor").
  const openMega = () => { window.clearTimeout(closeTimer.current); setMega(true) }
  const closeSoon = () => { closeTimer.current = window.setTimeout(() => { setMega(false); hoverOpened.current = false }, 160) }
  const hoverIn = ({ pointerType }: { pointerType: string }) => { if (pointerType !== 'mouse') return; if (!mega) hoverOpened.current = true; openMega() }
  const hoverOut = ({ pointerType }: { pointerType: string }) => { if (pointerType === 'mouse') closeSoon() }
  const toggleMega = () => { if (hoverOpened.current) { hoverOpened.current = false; return } setMega((v) => !v) }
  const solActive = location.pathname.startsWith('/soluciones')
  const linkCls = (active: boolean) => cn('flex items-center gap-1 px-3 py-2 text-[0.97rem] transition-colors xl:px-4', active ? 'font-medium text-corp' : 'text-body hover:text-ink')

  return (
    <header
      className={cn('sticky z-50 bg-white transition-shadow duration-300', scrolled || mega ? 'shadow-[0_1px_0_#E1E6EB]' : '')}
      style={{ top: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="container flex h-[106px] items-center justify-between gap-6 md:h-[124px]">
        <Link to="/" aria-label="Interfaz Redes y Telecomunicaciones, ir al inicio" className="shrink-0"><LogoLockup /></Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center">
            {NAV.map((item) =>
              item.mega ? (
                <li key={item.to} onPointerEnter={hoverIn} onPointerLeave={hoverOut}>
                  <button
                    ref={megaBtn}
                    type="button"
                    aria-expanded={mega}
                    aria-controls="mega-soluciones"
                    onClick={toggleMega}
                    onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); setMega(true); requestAnimationFrame(() => firstLink.current?.focus()) } }}
                    className={linkCls(solActive || mega)}
                  >
                    Soluciones
                    <ChevronDown aria-hidden className={cn('h-4 w-4 transition-transform duration-200', mega && 'rotate-180')} strokeWidth={1.75} />
                  </button>
                </li>
              ) : (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.end} className={({ isActive }) => linkCls(isActive)}>{item.label}</NavLink>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Button to="/contacto" className="hidden !px-5 !py-[0.7rem] sm:inline-flex">Cotizar proyecto</Button>
          <button
            type="button"
            className="-mr-2 grid h-11 w-11 place-items-center text-ink lg:hidden"
            aria-label={mobile ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobile}
            aria-controls="menu-movil"
            onClick={() => setMobile((v) => !v)}
          >
            {mobile ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mega && (
          <motion.div
            id="mega-soluciones"
            onPointerEnter={hoverIn}
            onPointerLeave={hoverOut}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-full hidden border-t border-line bg-white shadow-[0_24px_40px_-24px_rgba(8,29,54,0.25)] lg:block"
          >
            <div className="container grid grid-cols-5 gap-10 pb-10 pt-9">
              {CATEGORIES.map((cat, ci) => (
                <div key={cat.id}>
                  <Link to={`/soluciones?s=${cat.id}`} className="block font-display text-[1.05rem] font-semibold leading-snug text-ink hover:text-corp">{cat.name}</Link>
                  <p className="mt-1.5 text-small text-muted">{cat.lede}</p>
                  <ul className="mt-5 space-y-1">
                    {servicesOf(cat.id).map((s, si) => (
                      <li key={s.slug}>
                        <Link ref={ci === 0 && si === 0 ? firstLink : undefined} to={`/soluciones/${s.slug}`} className="block py-1.5 text-[0.97rem] text-body transition-colors hover:text-corp focus-visible:text-corp">
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-line bg-mist">
              <div className="container flex items-center justify-between py-4 text-small">
                <p className="text-body">¿No sabe qué solución aplica? Un levantamiento en sitio define el alcance.</p>
                <div className="flex items-center gap-8">
                  <Link to="/soluciones" className="font-medium text-corp link-line">Ver todas las soluciones</Link>
                  <Link to="/contacto" className="font-medium text-corp link-line">Solicitar cotización</Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{mobile && <MobileNav onClose={() => setMobile(false)} reduce={!!reduce} />}</AnimatePresence>
    </header>
  )
}

function MobileNav({ onClose, reduce }: { onClose: () => void; reduce: boolean }) {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <motion.div
      id="menu-movil"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-x-0 top-full z-40 h-[calc(100dvh-106px)] overflow-y-auto border-t border-line bg-white md:h-[calc(100dvh-124px)] lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <nav aria-label="Menú móvil" className="container flex min-h-full flex-col pb-6 pt-2">
        <ul>
          <li className="border-b border-line"><Link onClick={onClose} to="/" className="flex min-h-[60px] items-center font-display text-[1.35rem] font-medium text-ink">Inicio</Link></li>
          <li className="border-b border-line">
            <button type="button" aria-expanded={open === 'sol'} onClick={() => setOpen(open === 'sol' ? null : 'sol')} className="flex min-h-[60px] w-full items-center justify-between font-display text-[1.35rem] font-medium text-ink">
              Soluciones
              <ChevronDown aria-hidden className={cn('h-5 w-5 text-muted transition-transform', open === 'sol' && 'rotate-180')} strokeWidth={1.75} />
            </button>
            {open === 'sol' && (
              <div className="space-y-6 pb-6 pt-1">
                {CATEGORIES.map((cat) => (
                  <div key={cat.id}>
                    <p className="text-small font-medium text-corp">{cat.name}</p>
                    <ul className="mt-1">
                      {servicesOf(cat.id).map((s) => (
                        <li key={s.slug}><Link onClick={onClose} to={`/soluciones/${s.slug}`} className="flex min-h-[44px] items-center text-[1.02rem] text-body">{s.name}</Link></li>
                      ))}
                    </ul>
                  </div>
                ))}
                <Link onClick={onClose} to="/soluciones" className="inline-block font-medium text-corp link-line">Ver índice de soluciones</Link>
              </div>
            )}
          </li>
          {NAV.slice(2).map((n) => (
            <li key={n.to} className="border-b border-line"><Link onClick={onClose} to={n.to} className="flex min-h-[60px] items-center font-display text-[1.35rem] font-medium text-ink">{n.label}</Link></li>
          ))}
        </ul>
        <div className="mt-auto space-y-3 pt-10">
          <Button to="/contacto" className="w-full">Cotizar proyecto</Button>
          <Button href={waLink('Hola, quiero hablar con un especialista de Interfaz Redes.')} variant="secondary" className="w-full">WhatsApp {COMPANY.whatsappDisplay}</Button>
        </div>
      </nav>
    </motion.div>
  )
}
