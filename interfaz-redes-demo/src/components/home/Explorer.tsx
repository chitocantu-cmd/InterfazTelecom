import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES, servicesOf, type Category } from '../../data/solutions'
import { cn } from '../../lib/utils'
import { Media } from '../plates'

function Panel({ cat, inline }: { cat: Category; inline?: boolean }) {
  return (
    <div>
      <Media img={cat.img} plate={cat.plate} ratio="aspect-[3/2]" />
      <div className="mt-8 grid gap-8 md:grid-cols-12">
        <div className="md:col-span-5">
          {!inline && <h3 className="text-h3">{cat.name}</h3>}
          <p className={cn('text-small text-body', !inline && 'mt-3')}>{cat.technical}</p>
          <Link to={`/soluciones?s=${cat.id}`} className="mt-5 inline-block text-small font-medium text-corp link-line">Ver {cat.name.toLowerCase()}</Link>
        </div>
        <ul className="border-t border-line md:col-span-7">
          {servicesOf(cat.id).map((s) => (
            <li key={s.slug} className="border-b border-line">
              <Link to={`/soluciones/${s.slug}`} className="group block py-4">
                <span className="block font-display text-[1.1rem] font-medium text-ink transition-colors group-hover:text-corp">{s.name}</span>
                <span className="mt-0.5 block text-small text-muted">{s.short}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function Explorer() {
  const [active, setActive] = useState(CATEGORIES[0].id)
  const reduce = useReducedMotion()
  const cat = CATEGORIES.find((c) => c.id === active)!

  return (
    <section id="soluciones" className="scroll-mt-20 bg-mist py-20 md:py-28" aria-labelledby="soluciones-title">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <h2 id="soluciones-title" className="text-h2">Soluciones</h2>
            <p className="mt-4 max-w-sm text-body">Cinco frentes técnicos que diseñamos, instalamos y mantenemos con el mismo equipo.</p>

            <ul className="mt-10 border-t border-line" aria-label="Frentes técnicos">
              {CATEGORIES.map((c) => {
                const on = c.id === active
                return (
                  <li key={c.id} className="border-b border-line">
                    <button type="button" aria-expanded={on} onClick={() => setActive(c.id)} className="group w-full py-5 text-left">
                      <span className={cn('block font-display text-[1.45rem] font-medium leading-tight tracking-[-0.015em] transition-colors', on ? 'text-ink' : 'text-muted group-hover:text-ink')}>{c.name}</span>
                      <span className={cn('mt-1 block text-small transition-colors', on ? 'text-body' : 'text-muted')}>{c.lede}</span>
                    </button>
                    {on && <div className="pb-10 lg:hidden"><Panel cat={c} inline /></div>}
                  </li>
                )
              })}
            </ul>
            <Link to="/soluciones" className="mt-8 hidden text-small font-medium text-corp link-line lg:inline-block">Índice completo de soluciones</Link>
          </div>

          <div className="hidden lg:col-span-8 lg:block">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={cat.id} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <Panel cat={cat} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
