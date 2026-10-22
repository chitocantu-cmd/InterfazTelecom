import { AnimatePresence, m } from 'motion/react'
import { ArrowRight, ChevronDown, Compass, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { publishedResources } from '../../content/recursos'
import { IMG } from '../../data/media'
import type { CategoryId } from '../../data/solutions'
import { useI18n } from '../../i18n'
import { splitLocale } from '../../i18n/config'
import { Link, NavLink } from '../../i18n/Link'
import { cn, waLink, useReducedMotion } from '../../lib/utils'
import { COMPANY } from '../../data/company'
import { Button } from '../ui'
import { LanguageSelector } from './LanguageSelector'
import { LogoLockup } from './Logo'

/** El centro técnico aparece en el menú cuando tiene al menos un artículo publicado. */
const SHOW_RESOURCES = publishedResources().length > 0

/**
 * Header fijo. Arriba muestra el logotipo a tamaño completo; al desplazarse se compacta. Un espacio del mismo alto
 * que el header en reposo (--hdr) queda en la página, así el contenido nunca se mueve cuando cambia de tamaño.
 */
export function Header() {
  const { t, c } = useI18n()
  const [scrolled, setScrolled] = useState(false)
  const [mega, setMega] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [preview, setPreview] = useState<CategoryId>(c.categories[0].id)
  const location = useLocation()
  const base = splitLocale(location.pathname).path
  const closeTimer = useRef<number>()
  const headerRef = useRef<HTMLElement>(null)
  const megaItem = useRef<HTMLLIElement>(null)
  const megaBtn = useRef<HTMLButtonElement>(null)
  const megaPanel = useRef<HTMLDivElement>(null)
  const firstLink = useRef<HTMLAnchorElement>(null)
  const mobileBtn = useRef<HTMLButtonElement>(null)
  const hoverOpened = useRef(false) // el menú lo abrió el cursor y aún no hay clic
  const reduce = useReducedMotion()
  const compact = scrolled && !mobile

  const NAV = [
    { to: '/soluciones', label: t.nav.solutions, mega: true },
    { to: '/industrias', label: t.nav.industries },
    { to: '/proyectos', label: t.nav.projects },
    { to: '/explorador', label: t.nav.explorer },
    ...(SHOW_RESOURCES ? [{ to: '/recursos', label: t.nav.resources }] : []),
    { to: '/nosotros', label: t.nav.about },
    { to: '/contacto', label: t.nav.contact },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => { setMega(false); setMobile(false); hoverOpened.current = false }, [location.pathname, location.search, location.hash])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      // El foco vuelve al botón que abrió el menú (si no, cae al inicio de la página).
      if (mega) megaBtn.current?.focus()
      if (mobile) mobileBtn.current?.focus()
      setMega(false); setMobile(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mega, mobile])
  useEffect(() => {
    if (!mobile) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Mientras el menú móvil cubre la página, el teclado no recorre lo que queda detrás.
    const behind = Array.from(headerRef.current?.parentElement?.children ?? []).filter((el) => el !== headerRef.current)
    behind.forEach((el) => el.setAttribute('inert', ''))
    // Si la pantalla se ensancha (tableta girada), el menú móvil desaparece: se cierra para liberar el scroll.
    const wide = window.matchMedia('(min-width: 1024px)')
    const closeIfWide = () => { if (wide.matches) setMobile(false) }
    wide.addEventListener('change', closeIfWide)
    return () => {
      document.body.style.overflow = prevOverflow
      behind.forEach((el) => el.removeAttribute('inert'))
      wide.removeEventListener('change', closeIfWide)
    }
  }, [mobile])

  // Con mouse el menú abre al pasar el cursor, y el clic que suele seguir no debe cerrarlo.
  // Con toque o teclado el clic abre y cierra (en pantallas táctiles no hay "pasar el cursor").
  const openMega = () => { window.clearTimeout(closeTimer.current); setMega(true) }
  const closeSoon = () => { closeTimer.current = window.setTimeout(() => { setMega(false); hoverOpened.current = false }, 160) }
  const hoverIn = ({ pointerType }: { pointerType: string }) => { if (pointerType !== 'mouse') return; if (!mega) hoverOpened.current = true; openMega() }
  const hoverOut = ({ pointerType }: { pointerType: string }) => { if (pointerType === 'mouse') closeSoon() }
  const closeMega = () => { setMega(false); hoverOpened.current = false }
  const toggleMega = (e: MouseEvent) => {
    if (hoverOpened.current) { hoverOpened.current = false; return }
    // Abierto con Enter o Espacio (detail 0): el foco entra al panel, como con la flecha abajo.
    if (!mega && e.detail === 0) requestAnimationFrame(() => firstLink.current?.focus())
    setMega((v) => !v)
  }
  // Al salir con el teclado del botón o del panel hacia otro elemento, el panel se cierra (no tapa el foco).
  const leaveMega = (e: FocusEvent) => {
    const next = e.relatedTarget as Node | null
    if (next && !megaItem.current?.contains(next) && !megaPanel.current?.contains(next)) closeMega()
  }
  // Tab desde el botón entra al panel; desde el último enlace sigue con el siguiente del menú; Mayús+Tab desde el primero vuelve al botón.
  const megaTab = (e: ReactKeyboardEvent) => {
    if (e.key !== 'Tab' || !mega) return
    const links = megaPanel.current?.querySelectorAll<HTMLElement>('a[href]')
    if (!links?.length) return
    const active = document.activeElement
    if (active === megaBtn.current && !e.shiftKey) { e.preventDefault(); links[0].focus() }
    else if (active === links[0] && e.shiftKey) { e.preventDefault(); megaBtn.current?.focus() }
    else if (active === links[links.length - 1] && !e.shiftKey) {
      e.preventDefault()
      closeMega()
      megaItem.current?.nextElementSibling?.querySelector<HTMLElement>('a')?.focus()
    }
  }
  const solActive = base.startsWith('/soluciones')
  const linkCls = (active: boolean) => cn('flex items-center gap-1 whitespace-nowrap px-2.5 py-2 text-[0.95rem] transition-colors xl:px-3.5', active ? 'font-medium text-corp' : 'text-body hover:text-ink')
  const cat = c.categoryById(preview)
  const img = cat.img ? IMG[cat.img] : null

  return (
    <>
      {/* Reserva el alto del header en reposo: al compactarse, el contenido no se mueve. */}
      <div aria-hidden className="h-[var(--hdr)]" />
      <header
        ref={headerRef}
        className={cn('enter-header fixed inset-x-0 z-50 bg-white transition-[height,box-shadow] duration-300 ease-out', compact ? 'h-[72px] md:h-[84px]' : 'h-[var(--hdr)]', scrolled || mega || mobile ? 'shadow-[0_1px_0_#E1E6EB]' : '')}
        style={{ top: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="container flex h-full items-center justify-between gap-4 lg:gap-6">
          <Link to="/" aria-label={t.nav.homeAria} className="shrink-0"><LogoLockup compact={compact} /></Link>

          <nav aria-label={t.nav.main} className="hidden lg:block">
            <ul className="flex items-center">
              {NAV.map((item) =>
                item.mega ? (
                  <li key={item.to} ref={megaItem} onPointerEnter={hoverIn} onPointerLeave={hoverOut} onBlur={leaveMega}>
                    <button
                      ref={megaBtn}
                      type="button"
                      aria-expanded={mega}
                      aria-controls="mega-soluciones"
                      onClick={toggleMega}
                      onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); setMega(true); requestAnimationFrame(() => firstLink.current?.focus()) } else megaTab(e) }}
                      className={linkCls(solActive || mega)}
                    >
                      {item.label}
                      {solActive && <span className="sr-only">{t.common.currentSection}</span>}
                      <ChevronDown aria-hidden className={cn('h-4 w-4 transition-transform duration-200', mega && 'rotate-180')} strokeWidth={1.75} />
                    </button>
                  </li>
                ) : (
                  <li key={item.to}>
                    <NavLink to={item.to} className={({ isActive }) => linkCls(isActive)}>{item.label}</NavLink>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="hidden lg:block"><LanguageSelector /></div>
            <Button to="/contacto" track="header" className="hidden !px-5 !py-[0.7rem] lg:inline-flex">{t.common.quoteProject}</Button>
            <Button to="/contacto" track="header-movil" className="!px-4 !py-2.5 !text-[0.9rem] lg:hidden">{t.common.quoteShort}</Button>
            <button
              ref={mobileBtn}
              type="button"
              className="-mr-2 grid h-11 w-11 place-items-center text-ink lg:hidden"
              aria-label={mobile ? t.nav.close : t.nav.open}
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
            <m.div
              ref={megaPanel}
              id="mega-soluciones"
              onPointerEnter={hoverIn}
              onPointerLeave={hoverOut}
              onBlur={leaveMega}
              onKeyDown={megaTab}
              onClick={(e) => { if ((e.target as HTMLElement).closest('a')) closeMega() }}
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
              className="absolute inset-x-0 top-full hidden border-t border-line bg-white shadow-[0_24px_40px_-24px_rgba(8,29,54,0.25)] lg:block"
            >
              <div className="container grid grid-cols-12 gap-10 pb-10 pt-9">
                <div className="col-span-8 grid grid-cols-3 gap-x-8 gap-y-9">
                  {c.categories.map((ct, ci) => (
                    <div key={ct.id} onPointerEnter={() => setPreview(ct.id)} onFocus={() => setPreview(ct.id)}>
                      <Link ref={ci === 0 ? firstLink : undefined} to={`/soluciones#${ct.id}`} className={cn('block font-display text-[1.05rem] font-semibold leading-snug transition-colors hover:text-corp', preview === ct.id ? 'text-corp' : 'text-ink')}>{ct.name}</Link>
                      <ul className="mt-3 space-y-0.5">
                        {c.servicesOf(ct.id).map((s) => (
                          <li key={s.slug}>
                            <Link to={`/soluciones/${s.slug}`} className="block py-1.5 text-[0.94rem] text-body transition-colors hover:text-corp focus-visible:text-corp">{s.name}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <aside className="col-span-4 border-l border-line pl-10" aria-live="polite">
                  <div className="relative aspect-[16/10] overflow-hidden bg-mist">
                    {img && <img key={cat.id} src={img.src} srcSet={img.srcSet} sizes="380px" alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: img.pos }} />}
                  </div>
                  <p className="mt-4 mono-tag uppercase text-muted">{t.mega.preview} · {cat.code}</p>
                  <p className="mt-1 font-display text-[1.1rem] font-semibold text-ink">{cat.name}</p>
                  <p className="mt-1.5 line-clamp-3 text-small text-body">{cat.technical}</p>
                  <Link to="/explorador" className="group mt-6 flex items-start gap-3 border-t border-line pt-5">
                    <Compass aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-corp" strokeWidth={1.6} />
                    <span>
                      <span className="flex items-center gap-1.5 font-medium text-ink transition-colors group-hover:text-corp">{t.mega.explorerTitle}<ArrowRight aria-hidden className="arrow-nudge h-4 w-4" strokeWidth={1.75} /></span>
                      <span className="mt-0.5 block text-small text-muted">{t.mega.explorerText}</span>
                    </span>
                  </Link>
                </aside>
              </div>
              <div className="border-t border-line bg-mist">
                <div className="container flex items-center justify-between py-4 text-small">
                  <p className="text-body">{t.mega.footer}</p>
                  <div className="flex items-center gap-8">
                    <Link to="/industrias" className="font-medium text-corp link-line">{t.mega.industries}</Link>
                    <Link to="/soluciones" className="font-medium text-corp link-line">{t.mega.allSolutions}</Link>
                    <Link to="/contacto" className="font-medium text-corp link-line" data-track-cta="mega-menu">{t.common.requestQuote}</Link>
                  </div>
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        <AnimatePresence>{mobile && <MobileNav onClose={() => setMobile(false)} reduce={!!reduce} nav={NAV.slice(1)} />}</AnimatePresence>
      </header>
    </>
  )
}

function MobileNav({ onClose, reduce, nav }: { onClose: () => void; reduce: boolean; nav: { to: string; label: string }[] }) {
  const { t, c } = useI18n()
  const [open, setOpen] = useState<string | null>(null)
  const solActive = splitLocale(useLocation().pathname).path.startsWith('/soluciones')
  return (
    <m.div
      id="menu-movil"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-x-0 top-full z-40 h-[calc(100dvh-var(--hdr))] overflow-y-auto border-t border-line bg-white lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <nav aria-label={t.nav.mobile} className="container flex min-h-full flex-col pb-6 pt-2">
        <ul>
          <li className="border-b border-line"><NavLink onClick={onClose} to="/" end className="flex min-h-[60px] items-center font-display text-[1.35rem] font-medium text-ink">{t.common.home}</NavLink></li>
          <li className="border-b border-line">
            <button type="button" aria-expanded={open === 'sol'} onClick={() => setOpen(open === 'sol' ? null : 'sol')} className="flex min-h-[60px] w-full items-center justify-between font-display text-[1.35rem] font-medium text-ink">
              <span>{t.nav.solutions}{solActive && <span className="sr-only">{t.common.currentSection}</span>}</span>
              <ChevronDown aria-hidden className={cn('h-5 w-5 text-muted transition-transform', open === 'sol' && 'rotate-180')} strokeWidth={1.75} />
            </button>
            {open === 'sol' && (
              <div className="space-y-6 pb-6 pt-1">
                {c.categories.map((cat) => (
                  <div key={cat.id}>
                    <p className="text-small font-medium text-corp">{cat.name}</p>
                    <ul className="mt-1">
                      {c.servicesOf(cat.id).map((s) => (
                        <li key={s.slug}><Link onClick={onClose} to={`/soluciones/${s.slug}`} className="flex min-h-[44px] items-center text-[1.02rem] text-body">{s.name}</Link></li>
                      ))}
                    </ul>
                  </div>
                ))}
                <Link onClick={onClose} to="/soluciones" className="inline-block font-medium text-corp link-line">{t.mega.seeIndex}</Link>
              </div>
            )}
          </li>
          {nav.map((n) => (
            <li key={n.to} className="border-b border-line"><NavLink onClick={onClose} to={n.to} className="flex min-h-[60px] items-center font-display text-[1.35rem] font-medium text-ink">{n.label}</NavLink></li>
          ))}
        </ul>
        <div className="mt-8"><LanguageSelector variant="menu" /></div>
        <div className="mt-auto space-y-3 pt-10">
          <Button to="/contacto" track="menu-movil" className="w-full">{t.common.quoteProject}</Button>
          <Button href={waLink(t.wa.general)} variant="secondary" className="w-full">WhatsApp {COMPANY.whatsappDisplay}</Button>
        </div>
      </nav>
    </m.div>
  )
}
