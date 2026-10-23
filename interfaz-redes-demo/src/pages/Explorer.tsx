import { AnimatePresence, m } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, ClipboardList, Compass, Link2, MapPin, MessageSquareText, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Breadcrumbs } from '../components/layout/PageHero'
import { Button, Tag } from '../components/ui'
import { explorerQuery, isComplete, readExplorer, recommend, type ExplorerState, type Option } from '../data/explorer'
import { useI18n } from '../i18n'
import { Link } from '../i18n/Link'
import { track } from '../lib/analytics'
import { cn, copyText, useHideFloating, useHydrated, useReducedMotion } from '../lib/utils'
import { useSeo } from '../lib/seo'

type Key = 'scenario' | 'place' | 'location' | 'size' | 'stage' | 'extras'
const ORDER: Key[] = ['scenario', 'place', 'location', 'size', 'stage', 'extras']
const RESULT = ORDER.length
const EMPTY: ExplorerState = { extras: [] }

/**
 * Explorador de soluciones: seis preguntas y un resumen orientativo (servicios que suelen intervenir, información que
 * conviene preparar y preguntas del levantamiento), que se envía al cotizador. El estado vive en la URL
 * (?escenario=…&inmueble=…), así el resultado se puede compartir con un enlace.
 */
export default function Explorer() {
  const { t, c } = useI18n()
  const T = t.explorer
  useSeo(t.seo.explorer)
  const hydrated = useHydrated()
  const reduce = useReducedMotion()
  const [params, setParams] = useSearchParams()
  const [state, setState] = useState<ExplorerState>(EMPTY)
  const [step, setStep] = useState(0)
  const [tried, setTried] = useState(false)
  const [copied, setCopied] = useState(false)
  const top = useRef<HTMLDivElement>(null)
  const restored = useRef(false)
  const area = useHideFloating<HTMLElement>()

  // Al hidratar, retoma lo que traiga la URL (enlace compartido o un escenario elegido en la portada).
  useEffect(() => {
    if (!hydrated || restored.current) return
    restored.current = true
    const s = readExplorer(params)
    if (!s.scenario) return
    setState(s)
    setStep(isComplete(s) ? RESULT : ORDER.findIndex((k) => k !== 'extras' && !s[k]))
  }, [hydrated, params])

  const commit = (next: ExplorerState) => {
    setState(next)
    setTried(false)
    setParams(new URLSearchParams(explorerQuery(next)), { replace: true })
  }
  const goTo = (n: number) => {
    setStep(n)
    setTried(false)
    if (n === RESULT) {
      const rec = recommend(state, { scenarios: c.explorer.scenarios, rules: c.explorer.rules })
      track('explorer_complete', { escenario: state.scenario ?? '', servicios: rec?.services.length ?? 0 })
    } else if (n > step) track('explorer_step', { paso: n + 1, escenario: state.scenario ?? '' })
    requestAnimationFrame(() => {
      const el = top.current
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.top < 80 || r.top > window.innerHeight * 0.4) window.scrollTo({ top: window.scrollY + r.top - 130, behavior: reduce ? 'auto' : 'smooth' })
    })
  }
  const key = ORDER[step]
  const answered = (k: Key) => k === 'extras' || Boolean(state[k])
  const next = () => {
    if (!answered(key)) { setTried(true); return }
    goTo(step + 1)
  }
  const focusTitle = () => requestAnimationFrame(() => requestAnimationFrame(() => top.current?.querySelector<HTMLElement>('[data-step-title]')?.focus()))

  const lists: Record<Exclude<Key, 'scenario' | 'extras'>, Option[]> = {
    place: c.explorer.places,
    location: c.explorer.locations,
    size: c.explorer.sizes,
    stage: c.explorer.stages,
  }
  const rec = step === RESULT ? recommend(state, { scenarios: c.explorer.scenarios, rules: c.explorer.rules }) : null
  const scenario = c.explorer.scenarios.find((s) => s.id === state.scenario)
  const quoteHref = `/contacto?${explorerQuery(state)}`

  return (
    <>
      <section className="bg-white">
        <div className="container pb-12 pt-10 md:pt-12">
          <Breadcrumbs items={[{ label: t.nav.explorer }]} />
          <div className="mt-12 grid gap-8 md:mt-16 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <Tag className="!text-corp">{t.nav.explorer}</Tag>
              <h1 className="mt-3 text-h1">{T.title}</h1>
            </div>
            <div className="lg:col-span-4 lg:col-start-9">
              <p className="max-w-measure text-lead text-body">{T.lede}</p>
            </div>
          </div>
        </div>
      </section>

      <section ref={area} className="bg-mist py-12 md:py-20">
        <div className="container grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8" ref={top}>
            <div className="border border-line bg-white">
              {/* progreso */}
              <ol className="grid grid-cols-6 border-b border-line" aria-label={T.progress}>
                {T.steps.map((s, i) => (
                  <li key={s} className={cn('relative px-2 py-3 sm:px-4', i > 0 && 'border-l border-line')} aria-current={i === step ? 'step' : undefined}>
                    <span className={cn('font-mono text-[0.68rem] tracking-[0.1em]', i === step ? 'text-tech' : i < step ? 'text-ink' : 'text-muted')}>
                      {i < step ? <Check aria-hidden className="mb-0.5 inline h-3 w-3" /> : `0${i + 1}`}
                    </span>
                    <span className={cn('ml-1.5 hidden text-[0.82rem] md:inline', i === step ? 'font-medium text-ink' : 'text-muted')}>{s}</span>
                    <span aria-hidden className={cn('absolute inset-x-0 bottom-0 h-[2px] transition-colors duration-300', i <= step ? 'bg-tech' : 'bg-transparent')} />
                  </li>
                ))}
              </ol>

              <div className="p-5 sm:p-8">
                <AnimatePresence mode="wait" initial={false} onExitComplete={focusTitle}>
                  <m.div key={step} initial={reduce ? false : { opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, x: -10 }} transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}>
                    {step === 0 && (
                      <fieldset>
                        <legend data-step-title tabIndex={-1} className="font-display text-[1.6rem] font-semibold leading-tight text-ink outline-none">{T.questions.scenario}</legend>
                        <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                          {c.explorer.scenarios.map((s) => {
                            const on = state.scenario === s.id
                            return (
                              <label key={s.id} className={cn('relative flex cursor-pointer flex-col border p-4 transition-colors', on ? 'border-corp bg-corp text-white' : 'border-line hover:border-tech')}>
                                <input type="radio" name="escenario" value={s.id} checked={on} onChange={() => commit({ ...state, scenario: s.id })} className="peer sr-only" />
                                <span className="pr-6 font-medium leading-tight">{s.label}</span>
                                <span className={cn('mt-1 text-[0.8rem] leading-snug', on ? 'text-white/70' : 'text-muted')}>{s.hint}</span>
                                <span aria-hidden className={cn('absolute right-3 top-3 grid h-4 w-4 place-items-center rounded-full border', on ? 'border-white bg-white' : 'border-line')}>{on && <span className="h-2 w-2 rounded-full bg-corp" />}</span>
                                <span aria-hidden className="pointer-events-none absolute inset-0 hidden ring-2 ring-lumen ring-offset-2 peer-focus-visible:block" />
                              </label>
                            )
                          })}
                        </div>
                        {tried && !state.scenario && <p role="alert" className="mt-3 text-[0.85rem] text-[#B42318]">{T.required}</p>}
                      </fieldset>
                    )}

                    {step > 0 && step < RESULT - 1 && (
                      <fieldset>
                        <legend data-step-title tabIndex={-1} className="font-display text-[1.6rem] font-semibold leading-tight text-ink outline-none">{T.questions[key]}</legend>
                        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                          {lists[key as keyof typeof lists].map((o) => {
                            const on = state[key as keyof typeof lists] === o.id
                            return (
                              <label key={o.id} className={cn('relative flex min-h-[52px] cursor-pointer items-center gap-3 border px-4 py-3 transition-colors', on ? 'border-corp bg-corp text-white' : 'border-line hover:border-tech')}>
                                <input type="radio" name={key} value={o.id} checked={on} onChange={() => commit({ ...state, [key]: o.id })} className="peer sr-only" />
                                <span aria-hidden className={cn('grid h-4 w-4 shrink-0 place-items-center rounded-full border', on ? 'border-white bg-white' : 'border-line')}>{on && <span className="h-2 w-2 rounded-full bg-corp" />}</span>
                                <span className="font-medium leading-snug">{o.label}</span>
                                <span aria-hidden className="pointer-events-none absolute inset-0 hidden ring-2 ring-lumen ring-offset-2 peer-focus-visible:block" />
                              </label>
                            )
                          })}
                        </div>
                        {tried && !answered(key) && <p role="alert" className="mt-3 text-[0.85rem] text-[#B42318]">{T.required}</p>}
                      </fieldset>
                    )}

                    {step === RESULT - 1 && (
                      <fieldset>
                        <legend data-step-title tabIndex={-1} className="font-display text-[1.6rem] font-semibold leading-tight text-ink outline-none">{T.questions.extras}</legend>
                        <p className="mt-1.5 text-[0.9rem] text-muted">{T.extrasHint}</p>
                        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                          {c.explorer.extras.map((o) => {
                            const on = state.extras.includes(o.id)
                            return (
                              <label key={o.id} className={cn('relative flex min-h-[52px] cursor-pointer items-center gap-3 border px-4 py-3 transition-colors', on ? 'border-corp bg-corp text-white' : 'border-line hover:border-tech')}>
                                <input type="checkbox" checked={on} onChange={() => commit({ ...state, extras: on ? state.extras.filter((x) => x !== o.id) : [...state.extras, o.id] })} className="peer sr-only" />
                                <span aria-hidden className={cn('grid h-4 w-4 shrink-0 place-items-center border', on ? 'border-white bg-white' : 'border-line')}>{on && <Check className="h-3 w-3 text-corp" strokeWidth={3} />}</span>
                                <span className="font-medium leading-snug">{o.label}</span>
                                <span aria-hidden className="pointer-events-none absolute inset-0 hidden ring-2 ring-lumen ring-offset-2 peer-focus-visible:block" />
                              </label>
                            )
                          })}
                        </div>
                      </fieldset>
                    )}

                    {step === RESULT && rec && scenario && (
                      <div>
                        <p className="inline-flex items-center gap-2 bg-ice px-2.5 py-1 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-corp"><Compass aria-hidden className="h-3.5 w-3.5" />{scenario.label}</p>
                        <h2 data-step-title tabIndex={-1} className="mt-3 font-display text-[1.6rem] font-semibold leading-tight text-ink outline-none">{T.resultTitle}</h2>
                        <ul className="mt-6 divide-y divide-line border-y border-line">
                          {rec.services.map((slug, i) => {
                            const s = c.serviceBySlug(slug)
                            if (!s) return null
                            return (
                              <li key={slug}>
                                <Link to={`/soluciones/${slug}`} className="group flex items-start gap-4 py-4">
                                  <span className="font-mono text-[0.75rem] text-muted tabular">{String(i + 1).padStart(2, '0')}</span>
                                  <span className="flex-1">
                                    <span className="block font-display text-[1.1rem] font-medium text-ink transition-colors group-hover:text-corp">{s.name}</span>
                                    <span className="mt-0.5 block text-small text-muted">{s.short}</span>
                                  </span>
                                  <ArrowRight aria-hidden className="arrow-nudge mt-1.5 h-4 w-4 shrink-0 text-faint group-hover:text-corp" strokeWidth={1.75} />
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                        <div className="mt-8 grid gap-8 sm:grid-cols-2">
                          <div>
                            <p className="flex items-center gap-2 text-small font-medium text-ink"><ClipboardList aria-hidden className="h-4 w-4 text-corp" strokeWidth={1.75} />{T.prepare}</p>
                            <ul className="mt-3 space-y-2 text-small text-body">{rec.prepare.map((x) => <li key={x} className="flex gap-2.5"><span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-corp" />{x}</li>)}</ul>
                          </div>
                          <div>
                            <p className="flex items-center gap-2 text-small font-medium text-ink"><MessageSquareText aria-hidden className="h-4 w-4 text-corp" strokeWidth={1.75} />{T.questionsTitle}</p>
                            <ul className="mt-3 space-y-2 text-small text-body">{rec.questions.map((x) => <li key={x} className="flex gap-2.5"><span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-corp" />{x}</li>)}</ul>
                          </div>
                        </div>
                        {rec.outside && <p className="mt-8 flex gap-2.5 bg-mist px-4 py-3 text-small text-body"><MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-corp" strokeWidth={1.75} />{c.explorer.rules.coverageFuera}</p>}
                        <div className="mt-8 border-t border-line pt-6">
                          <Button to={quoteHref} arrow className="w-full sm:w-auto" track="explorador-resultado">{T.cta}</Button>
                          <p className="mt-3 text-[0.85rem] text-muted">{T.ctaNote}</p>
                          <p className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-[0.9rem]">
                            <button type="button" onClick={() => goTo(0)} className="inline-flex items-center gap-2 font-medium text-ink hover:text-corp"><ArrowLeft aria-hidden className="h-4 w-4" />{T.edit}</button>
                            <button type="button" onClick={async () => { if (await copyText(window.location.href)) { setCopied(true); window.setTimeout(() => setCopied(false), 1800) } }} className="inline-flex items-center gap-2 font-medium text-ink hover:text-corp">
                              {copied ? <Check aria-hidden className="h-4 w-4" /> : <Link2 aria-hidden className="h-4 w-4" />}{copied ? T.shared : T.share}
                            </button>
                            <button type="button" onClick={() => { commit(EMPTY); goTo(0) }} className="inline-flex items-center gap-2 font-medium text-muted hover:text-ink"><RotateCcw aria-hidden className="h-4 w-4" />{T.restart}</button>
                          </p>
                          <span className="sr-only" aria-live="polite">{copied ? T.shared : ''}</span>
                        </div>
                      </div>
                    )}
                  </m.div>
                </AnimatePresence>

                {step < RESULT && (
                  <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-5">
                    {step > 0 ? (
                      <button type="button" onClick={() => goTo(step - 1)} className="inline-flex items-center gap-2 text-[0.92rem] text-muted hover:text-ink"><ArrowLeft aria-hidden className="h-4 w-4" />{T.back}</button>
                    ) : <span className="font-mono text-[0.72rem] text-muted">{T.stepOf(1, RESULT)}</span>}
                    <button type="button" onClick={next} className="inline-flex items-center gap-2.5 rounded-[2px] bg-corp px-6 py-3 text-[0.95rem] font-medium text-white transition-[background-color,transform] hover:bg-navy active:scale-[0.98]">
                      {step === RESULT - 1 ? T.seeResult : T.next}
                    </button>
                  </div>
                )}
                <p className="sr-only" aria-live="polite">{step < RESULT ? T.stepOf(step + 1, RESULT) : T.resultTitle}</p>
              </div>
            </div>
          </div>

          {/* Resumen lateral de lo elegido */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-36">
              <div className="bg-navy p-6 text-white">
                <p className="mono-tag uppercase text-white/50">{T.summary}</p>
                <dl className="mt-4 divide-y divide-white/10 text-small">
                  {ORDER.map((k, i) => {
                    const value = k === 'scenario' ? scenario?.label
                      : k === 'extras' ? (state.extras.length ? state.extras.map((x) => c.explorer.extras.find((o) => o.id === x)?.label).join(', ') : (step >= RESULT - 1 ? T.none : undefined))
                      : lists[k].find((o) => o.id === state[k])?.label
                    return (
                      <div key={k} className="flex justify-between gap-4 py-2.5">
                        <dt className="text-white/55">{T.summaryLabels[k]}</dt>
                        <dd className="text-right">
                          {value
                            ? <button type="button" onClick={() => goTo(i)} className="text-white hover:text-lumen">{value}</button>
                            : <span className="text-white/30">—</span>}
                        </dd>
                      </div>
                    )
                  })}
                </dl>
              </div>
              <p className="mt-6 text-small text-muted">{T.disclaimer}</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
