import { AnimatePresence, m } from 'motion/react'
import { ArrowLeft, Cable, Cctv, Check, Compass, Copy, DoorClosed, FileText, Mail, MessageCircle, Paperclip, Pencil, Plus, RotateCcw, Send, Server, Spline, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { COMPANY } from '../../data/company'
import { quoteTypesFor, type QuoteType } from '../../data/quote-types'
import { useI18n } from '../../i18n'
import { Link } from '../../i18n/Link'
import { track } from '../../lib/analytics'
import { FILE_ACCEPT, FILES, MAX_LENGTH, SITES, fileExtension, quoteNotice, siteLabel, validateQuote, validationText, type QuoteRequest } from '../../lib/cotizacion'
import { cn, copyText, mailLink, waLink, useHideFloating, useReducedMotion } from '../../lib/utils'

const ICONS: Record<QuoteType, typeof Cable> = { cableado: Cable, fibra: Spline, cctv: Cctv, acceso: DoorClosed, infra: Server, otro: Plus }
const FREE_MAIL = /@(gmail|hotmail|outlook|live|yahoo|icloud|prodigy)\./i

type Data = Omit<QuoteRequest, 'context' | 'summary' | 'lang'> & { role: string }

/**
 * ¿Está activa la recepción automática (/api/cotizacion)? Se pregunta una vez por visita. Si no lo está
 * (sin credenciales, o en la vista previa de un solo archivo), el cotizador abre WhatsApp o el correo.
 */
let reception: Promise<boolean> | undefined
const receptionActive = () => {
  if (import.meta.env.VITE_ROUTER === 'hash') return Promise.resolve(false)
  // Si la consulta falla (red o arranque en frío), no se guarda: el siguiente cotizador vuelve a preguntar.
  return (reception ??= fetch('/api/cotizacion', { headers: { Accept: 'application/json' } })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then((j: { recepcion?: boolean }) => j?.recepcion === true)
    .catch(() => {
      reception = undefined
      return false
    }))
}

/**
 * Clave de cada envío (AAMMDD-uuid): un reintento sin cambios conserva el folio y no duplica avisos, aunque
 * se reintente después de medianoche (el servidor toma la fecha del folio de la clave).
 */
const newKey = () => {
  const d = new Date()
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
  return `${ymd}-${id}`
}

type Status = 'enviado' | 'parcial' | 'error' | 'no_configurado' | 'omitido' | 'prueba'
type Sending =
  | { state: 'idle' | 'sending' }
  | { state: 'error'; code: string; message: string }
  | {
      state: 'done'
      folio: string
      fecha: string
      estados: { correo: Status; whatsapp: Status; acuse: Status }
      /** Copia de lo enviado: la confirmación no depende de lo que quede en el formulario. */
      sent: { request: QuoteRequest; labels: string[]; files: string[] }
    }

/** Mensajes del servidor que ya sugieren el envío manual (no se repite la sugerencia). */
const SUGGESTS_MANUAL = ['entrega', 'servidor', 'no_configurado', 'limite', 'rechazada', 'tiempo']

/** Identidad de un archivo: dos «plano.pdf» de carpetas distintas son archivos distintos. */
const fileId = (f: File) => `${f.name}:${f.size}:${f.lastModified}`

const MAX_MB = FILES.totalBytes / 1048576

const fmtSize = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

/**
 * Borrador en sessionStorage (sólo en esta pestaña, sin archivos): si la página se recarga o el usuario vuelve con
 * «Atrás», la solicitud no se pierde. Se borra al enviarla. La firma evita recuperar el borrador de otro contexto.
 */
const DRAFT_KEY = 'cotizacion-borrador'
interface Draft { sig: string; d: Data; step: number; at: number }
const readDraft = (sig: string): Draft | null => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    const draft = raw ? (JSON.parse(raw) as Draft) : null
    return draft && draft.sig === sig && Date.now() - draft.at < 6 * 3600_000 ? draft : null
  } catch {
    return null
  }
}
const writeDraft = (draft: Draft | null) => {
  try {
    if (draft) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    else sessionStorage.removeItem(DRAFT_KEY)
  } catch { /* almacenamiento bloqueado: el formulario sigue funcionando sin borrador */ }
}

export interface QuoteWizardProps {
  initialTypes?: QuoteType[]
  /** Desde dónde se abrió (en el idioma de la página, se muestra al usuario). */
  context?: string
  /** El mismo contexto en español (lo lee el equipo comercial). Por omisión, `context`. */
  contextValue?: string
  initialDescription?: string
  initialSite?: string
  /** Resumen del explorador: líneas en el idioma de la página (se muestran) y el texto en español (se envía). */
  summary?: { lines: string[]; value: string }
  /** Origen para la medición (servicio, industria, contacto…). */
  origin?: string
}

export function QuoteWizard({ initialTypes, context, contextValue, initialDescription, initialSite, summary, origin = 'contacto' }: QuoteWizardProps) {
  const { t, locale } = useI18n()
  const T = t.quote
  const uid = useId().replace(/:/g, '')
  const reduce = useReducedMotion()
  const types = useMemo(() => quoteTypesFor(locale), [locale])
  const [step, setStep] = useState(0)
  const [tried, setTried] = useState<Record<number, boolean>>({})
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState<string>()
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const msgDetails = useRef<HTMLDetailsElement>(null)
  const [api, setApi] = useState(false)
  const [send, setSend] = useState<Sending>({ state: 'idle' })
  const [trap, setTrap] = useState('')
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({})
  const [restored, setRestored] = useState(false)
  /** Campo a enfocar al terminar la animación del cambio de paso (si no, se enfoca el título del paso). */
  const pendingFocus = useRef<string | null>(null)
  const startedAt = useRef(Date.now())
  const started = useRef(false)
  const keyRef = useRef(newKey())
  const fileRef = useRef<HTMLInputElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const empty: Data = { types: initialTypes ?? [], site: initialSite ?? '', location: '', description: initialDescription ?? '', name: '', company: '', role: '', email: '', phone: '' }
  const [d, setD] = useState<Data>(empty)
  const sig = `${origin}|${contextValue ?? context ?? ''}|${(initialTypes ?? []).join(',')}|${initialSite ?? ''}|${summary?.value.length ?? 0}`
  const ctxValue = contextValue ?? context

  useEffect(() => {
    let live = true
    receptionActive().then((on) => live && setApi(on))
    return () => { live = false }
  }, [])
  // Recupera el borrador de esta pestaña (después de hidratar: el HTML prerenderizado no lo conoce).
  useEffect(() => {
    const draft = readDraft(sig)
    if (!draft) return
    setD(draft.d)
    setStep(Math.min(draft.step, 2))
    setRestored(true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // Guarda el borrador al escribir (sin archivos: el navegador no permite guardarlos).
  useEffect(() => {
    if (send.state === 'done') return
    const changed = JSON.stringify(d) !== JSON.stringify(empty)
    if (!changed) return
    const id = window.setTimeout(() => writeDraft({ sig, d, step, at: Date.now() }), 400)
    return () => window.clearTimeout(id)
  }, [d, step]) // eslint-disable-line react-hooks/exhaustive-deps
  // Cualquier cambio después de un intento fallido es un envío nuevo (otra clave, otro folio): se limpian
  // el aviso de error y los errores que marcó el servidor.
  useEffect(() => {
    keyRef.current = newKey()
    setServerErrors({})
    setSend((s) => (s.state === 'error' ? { state: 'idle' } : s))
  }, [d, files])

  const set = <K extends keyof Data>(k: K, v: Data[K]) => {
    if (!started.current) {
      started.current = true
      track('quote_start', { origen: origin, tipos: d.types.join(',') })
    }
    setD((s) => ({ ...s, [k]: v }))
  }

  const request: QuoteRequest = useMemo(() => ({ ...d, role: d.role.trim() || undefined, context: ctxValue, summary: summary?.value, lang: locale }), [d, ctxValue, summary, locale])
  const errors = useMemo(() => {
    const e = validateQuote(request) as Record<string, string>
    // Con descripción precargada (?necesidad=), el cliente debe agregar la suya.
    const own = initialDescription ? request.description.replace(initialDescription.trim(), '').trim() : null
    if (own !== null && !e.description && own.length < 15) e.description = validationText(locale).descriptionOwn
    // Lo que rechazó el servidor tiene prioridad hasta que el cliente corrija el dato.
    return { ...e, ...serverErrors }
  }, [request, initialDescription, serverErrors, locale])

  const stepFields: string[][] = [['types'], ['location', 'description'], ['name', 'company', 'role', 'email', 'phone'], []]
  const err = (f: string, i: number) => (tried[i] ? errors[f] : undefined)
  const fieldId: Record<string, string> = {
    types: `${uid}-t-${types[0].id}`, location: `${uid}-loc`, description: `${uid}-desc`,
    name: `${uid}-name`, company: `${uid}-co`, role: `${uid}-role`, email: `${uid}-mail`, phone: `${uid}-tel`, files: `${uid}-files`,
  }

  /** Cambia de paso; el foco pasa al título del paso nuevo (o a `focusField`) cuando termina la animación. */
  const go = (to: number, focusField?: string) => {
    pendingFocus.current = focusField ? fieldId[focusField] : null
    setStep(to)
    if (to > step) track('quote_step', { paso: to + 1 })
    requestAnimationFrame(() => {
      const el = topRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.top < 130 || r.top > window.innerHeight * 0.5) window.scrollTo({ top: window.scrollY + r.top - 150, behavior: reduce ? 'auto' : 'smooth' })
    })
  }
  const focusStep = () => {
    const id = pendingFocus.current
    pendingFocus.current = null
    // onExitComplete llega antes de que se monte el paso nuevo: se espera a que esté en pantalla.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const el = id ? document.getElementById(id) : topRef.current?.querySelector<HTMLElement>('[data-step-title]')
      el?.focus()
    }))
  }
  const next = () => {
    setTried((tr) => ({ ...tr, [step]: true }))
    // Con errores, el foco va al primer campo que hay que corregir.
    const bad = stepFields[step].find((f) => errors[f])
    if (bad) return requestAnimationFrame(() => document.getElementById(fieldId[bad])?.focus())
    if (step === 1 && api && fileError) return document.getElementById(fieldId.files)?.focus()
    go(step + 1)
  }

  const typeLabels = d.types.map((tp) => types.find((q) => q.id === tp)!.label)
  const fileNames = files.map((f) => f.name)
  // Mismo formato que el aviso que recibe ventas por WhatsApp (src/lib/cotizacion.ts); va en español.
  const message = quoteNotice(request, { files: fileNames })

  /** Con envío automático se revisan tipo, cantidad y tamaño, porque los archivos viajan con la solicitud. */
  const checkFiles = (list: File[]) => {
    const bad = list.find((f) => !FILES.extensions.includes(fileExtension(f.name)))
    if (bad) return T.fileBadType(bad.name)
    if (list.length > FILES.max) return T.fileTooMany(FILES.max)
    if (list.reduce((sum, f) => sum + f.size, 0) > FILES.totalBytes) return T.fileTooBig(MAX_MB)
    return undefined
  }
  const addFiles = (picked: File[]) => {
    const all = [...files, ...picked.filter((n) => !files.some((c) => fileId(c) === fileId(n)))]
    const problem = api ? checkFiles(all) : undefined
    setFileError(problem)
    if (!problem) setFiles(all)
  }
  // Si la recepción automática se confirma después de agregar archivos, se revisan los que ya estaban.
  useEffect(() => {
    if (api && files.length) setFileError(checkFiles(files))
  }, [api]) // eslint-disable-line react-hooks/exhaustive-deps

  const lead = (method: 'formulario' | 'whatsapp' | 'email') => track('generate_lead', { method, need: d.types.join(','), idioma: locale, explorador: Boolean(summary) })

  const submit = async () => {
    if (send.state === 'sending') return
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setSend({ state: 'error', code: 'sin_conexion', message: T.errors.offline })
      track('quote_error', { codigo: 'sin_conexion' })
      return
    }
    setSend({ state: 'sending' })
    const sentCopy = { request, labels: typeLabels, files: fileNames }
    const body = new FormData()
    d.types.forEach((tp) => body.append('types', tp))
    for (const k of ['site', 'location', 'description', 'name', 'company', 'role', 'email', 'phone'] as const) body.append(k, d[k].trim())
    if (ctxValue) body.append('context', ctxValue)
    if (summary) body.append('summary', summary.value)
    body.append('lang', locale)
    body.append('key', keyRef.current)
    body.append('elapsed', String(Date.now() - startedAt.current))
    body.append('hp_ref', trap)
    files.forEach((f) => body.append('files', f, f.name))
    // AbortController + setTimeout en lugar de AbortSignal.timeout, que no existe en Safari/iOS anteriores a 16.
    const ctrl = new AbortController()
    const timer = window.setTimeout(() => ctrl.abort(), 60_000)
    try {
      const res = await fetch(`/api/cotizacion?lang=${encodeURIComponent(locale)}`, { method: 'POST', body, signal: ctrl.signal })
      const json = await res.json().catch(() => null)
      if (res.ok && json?.ok) {
        setStep(3)
        setSend({ state: 'done', folio: json.folio, fecha: json.fecha, estados: json.estados, sent: sentCopy })
        writeDraft(null)
        lead('formulario')
        return
      }
      track('quote_error', { codigo: json?.codigo ?? `http_${res.status}` })
      // Datos rechazados: se marcan los campos y se vuelve al primer paso con error.
      if (json?.codigo === 'invalida' && json.errores) {
        const rejected = Object.keys(json.errores)
        const target = stepFields.findIndex((fs) => fs.some((f) => rejected.includes(f)))
        setServerErrors(json.errores)
        setTried({ 0: true, 1: true, 2: true })
        setSend({ state: 'idle' })
        if (target >= 0) go(target, stepFields[target].find((f) => rejected.includes(f)))
        return
      }
      if (json?.codigo === 'archivos') {
        setFileError(json.mensaje)
        setSend({ state: 'idle' })
        go(1, 'files')
        return
      }
      setSend({ state: 'error', code: json?.codigo ?? `http_${res.status}`, message: json?.mensaje ?? T.errors.server })
    } catch {
      // Si se agotó el tiempo, la solicitud pudo haber llegado: reintentar con la misma clave no la duplica.
      const code = ctrl.signal.aborted ? 'tiempo' : 'red'
      track('quote_error', { codigo: code })
      setSend({ state: 'error', code, message: code === 'tiempo' ? T.errors.timeout : T.errors.network })
    } finally {
      window.clearTimeout(timer)
    }
    requestAnimationFrame(() => topRef.current?.focus())
  }
  const sending = send.state === 'sending'
  // «parcial»: llegó a parte del equipo (algunos correos o números), así que sí se recibió.
  const sent = (s: Status) => s === 'enviado' || s === 'parcial' || s === 'prueba'

  // Mientras el cotizador está en pantalla se oculta el botón flotante de WhatsApp (WhatsAppButton).
  const root = useHideFloating<HTMLDivElement>()

  const subject = T.subject(typeLabels[0] ?? T.subjectFallbackType, d.company.trim() || T.subjectFallbackCompany)
  const discardDraft = () => { writeDraft(null); setD(empty); setStep(0); setTried({}); setRestored(false) }

  return (
    <div ref={root} className="border border-line bg-white shadow-[0_1px_0_rgba(18,21,24,0.04)]">
      {/* progreso */}
      <ol className="flex border-b border-line" aria-label={T.progress}>
        {T.steps.map((s, i) => (
          <li key={s} className={cn('relative flex-1 px-3 py-3.5 sm:px-5', i > 0 && 'border-l border-line')} aria-current={i === step ? 'step' : undefined}>
            <span className={cn('font-mono text-[0.68rem] tracking-[0.1em]', i === step ? 'text-tech' : i < step ? 'text-ink' : 'text-muted')}>
              {i < step ? <Check aria-hidden className="mb-0.5 inline h-3 w-3" /> : `0${i + 1}`}
            </span>
            <span className={cn('ml-2 hidden text-[0.86rem] sm:inline', i === step ? 'font-medium text-ink' : 'text-muted')}>{s}</span>
            <span aria-hidden className={cn('absolute inset-x-0 bottom-0 h-[2px] transition-colors duration-300', i <= step ? 'bg-tech' : 'bg-transparent')} />
          </li>
        ))}
      </ol>

      <div ref={topRef} tabIndex={-1} className="outline-none p-5 sm:p-8">
        {restored && send.state !== 'done' && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-ice px-4 py-3 text-[0.88rem] text-body" role="status">
            <span>{T.draftRestored}</span>
            <button type="button" onClick={discardDraft} className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-corp"><RotateCcw aria-hidden className="h-3.5 w-3.5" />{T.draftDiscard}</button>
          </div>
        )}
        <AnimatePresence mode="wait" initial={false} onExitComplete={focusStep}>
          <m.div
            key={send.state === 'done' ? 'recibida' : step}
            initial={reduce ? false : { opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -10 }}
            transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {step === 0 && (
              <fieldset>
                <legend data-step-title tabIndex={-1} className="font-display text-[1.6rem] font-semibold text-ink outline-none">{T.needTitle}</legend>
                <p className="mt-1.5 text-[0.9rem] text-muted">{T.needHint}</p>
                {context && <p className="mt-3 inline-block bg-mist px-2.5 py-1 font-mono text-[0.75rem] text-ink">{T.from} {context}</p>}
                <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {types.map((q) => {
                    const Icon = ICONS[q.id]
                    const on = d.types.includes(q.id)
                    return (
                      <label key={q.id} className={cn('group relative flex cursor-pointer items-start gap-3 border p-4 transition-colors', on ? 'border-corp bg-corp text-white' : 'border-line hover:border-tech')}>
                        <input
                          type="checkbox"
                          id={`${uid}-t-${q.id}`}
                          className="peer sr-only"
                          checked={on}
                          onChange={() => set('types', on ? d.types.filter((x) => x !== q.id) : [...d.types, q.id])}
                        />
                        <Icon aria-hidden className={cn('mt-0.5 h-5 w-5 shrink-0', on ? 'text-tech' : 'text-ink')} strokeWidth={1.6} />
                        <span className="min-w-0">
                          <span className="block font-medium leading-tight">{q.label}</span>
                          <span className={cn('mt-1 block text-[0.8rem] leading-snug', on ? 'text-white/70' : 'text-muted')}>{q.hint}</span>
                        </span>
                        <span aria-hidden className={cn('absolute right-3 top-3 grid h-4 w-4 place-items-center border', on ? 'border-tech bg-tech' : 'border-line')}>
                          {on && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                        </span>
                        <span aria-hidden className="pointer-events-none absolute inset-0 hidden ring-2 ring-lumen ring-offset-2 peer-focus-visible:block" />
                      </label>
                    )
                  })}
                </div>
                {err('types', 0) && <p role="alert" className="mt-3 text-[0.85rem] text-[#B42318]">{errors.types}</p>}
              </fieldset>
            )}

            {step === 1 && (
              <div>
                <h3 data-step-title tabIndex={-1} className="font-display text-[1.6rem] font-semibold text-ink outline-none">{T.projectTitle}</h3>
                <p className="mt-1.5 text-[0.9rem] text-muted">{T.projectHint}</p>
                {summary && <SummaryBox title={T.summaryTitle} lines={summary.lines} />}
                <div className="mt-6 grid gap-5">
                  <fieldset>
                    <legend className="mb-2 text-[0.88rem] font-medium text-ink">{T.site} <span className="font-normal text-muted">{T.optional}</span></legend>
                    <div className="flex flex-wrap gap-2">
                      {SITES.map((s) => (
                        <button key={s} type="button" aria-pressed={d.site === s} onClick={() => set('site', d.site === s ? '' : s)} className={cn('rounded-[2px] border px-3.5 py-2 text-[0.9rem] transition-colors', d.site === s ? 'border-corp bg-corp text-white' : 'border-line hover:border-tech')}>
                          {siteLabel(s, locale)}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <Field id={`${uid}-loc`} label={T.location} error={err('location', 1)}>
                    <input id={`${uid}-loc`} className="field" maxLength={MAX_LENGTH.location} value={d.location} onChange={(e) => set('location', e.target.value)} placeholder={T.locationPlaceholder} aria-invalid={!!err('location', 1)} aria-describedby={err('location', 1) ? `${uid}-loc-e` : undefined} autoComplete="address-level2" />
                  </Field>
                  <Field id={`${uid}-desc`} label={T.description} error={err('description', 1)} hint={T.descriptionHint}>
                    <textarea id={`${uid}-desc`} rows={4} className="field resize-y" maxLength={MAX_LENGTH.description} value={d.description} onChange={(e) => set('description', e.target.value)} placeholder={T.descriptionPlaceholder} aria-invalid={!!err('description', 1)} aria-describedby={err('description', 1) ? `${uid}-desc-e` : `${uid}-desc-h`} />
                  </Field>
                  <div>
                    <p className="text-[0.88rem] font-medium text-ink">{T.files} <span className="font-normal text-muted">{T.optional}</span></p>
                    <input
                      ref={fileRef}
                      id={`${uid}-files`}
                      type="file"
                      multiple
                      accept={FILE_ACCEPT}
                      className="peer sr-only"
                      onChange={(e) => {
                        addFiles(Array.from(e.target.files ?? []))
                        e.target.value = ''
                      }}
                    />
                    <label htmlFor={`${uid}-files`} className="mt-2 flex cursor-pointer items-center gap-3 border border-dashed border-line bg-mist px-4 py-4 text-[0.9rem] text-ink transition-colors hover:border-tech peer-focus-visible:ring-2 peer-focus-visible:ring-lumen peer-focus-visible:ring-offset-2">
                      <Paperclip aria-hidden className="h-4 w-4" />
                      <span>{T.filesPick} <span className="text-muted">· {T.filesTypes}</span></span>
                    </label>
                    {files.length > 0 && (
                      <ul className="mt-2 divide-y divide-line border border-line">
                        {files.map((f) => (
                          <li key={fileId(f)} className="flex items-center justify-between gap-3 px-3 py-2 text-[0.85rem]">
                            <span className="flex min-w-0 items-center gap-2"><FileText aria-hidden className="h-4 w-4 shrink-0 text-faint" /><span className="truncate">{f.name}</span></span>
                            <span className="flex shrink-0 items-center gap-3 font-mono text-[0.75rem] text-muted">
                              {fmtSize(f.size)}
                              <button type="button" aria-label={T.removeFile(f.name)} onClick={() => { setFiles(files.filter((x) => fileId(x) !== fileId(f))); setFileError(undefined) }} className="text-faint hover:text-tech"><X className="h-4 w-4" /></button>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {fileError && <p role="alert" className="mt-2 text-[0.82rem] text-[#B42318]">{fileError}</p>}
                    <p className="mt-2 font-mono text-[0.72rem] leading-snug text-muted">{api ? T.filesApi(FILES.max, MAX_MB) : T.filesManual}</p>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 data-step-title tabIndex={-1} className="font-display text-[1.6rem] font-semibold text-ink outline-none">{T.contactTitle}</h3>
                <p className="mt-1.5 text-[0.9rem] text-muted">{T.contactHint}</p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field id={`${uid}-name`} label={T.name} error={err('name', 2)}>
                    <input id={`${uid}-name`} className="field" maxLength={MAX_LENGTH.name} value={d.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" aria-invalid={!!err('name', 2)} aria-describedby={err('name', 2) ? `${uid}-name-e` : undefined} />
                  </Field>
                  <Field id={`${uid}-co`} label={T.company} error={err('company', 2)}>
                    <input id={`${uid}-co`} className="field" maxLength={MAX_LENGTH.company} value={d.company} onChange={(e) => set('company', e.target.value)} autoComplete="organization" aria-invalid={!!err('company', 2)} aria-describedby={err('company', 2) ? `${uid}-co-e` : undefined} />
                  </Field>
                  <Field id={`${uid}-role`} label={T.role} optional={T.optional} error={err('role', 2)}>
                    <input id={`${uid}-role`} className="field" maxLength={MAX_LENGTH.role} value={d.role} onChange={(e) => set('role', e.target.value)} autoComplete="organization-title" aria-invalid={!!err('role', 2)} aria-describedby={err('role', 2) ? `${uid}-role-e` : undefined} />
                  </Field>
                  <Field id={`${uid}-mail`} label={T.email} error={err('email', 2)} hint={!err('email', 2) && FREE_MAIL.test(d.email) ? T.emailHint : undefined}>
                    <input id={`${uid}-mail`} type="email" inputMode="email" className="field" maxLength={MAX_LENGTH.email} value={d.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" placeholder={T.emailPlaceholder} aria-invalid={!!err('email', 2)} aria-describedby={err('email', 2) ? `${uid}-mail-e` : FREE_MAIL.test(d.email) ? `${uid}-mail-h` : undefined} />
                  </Field>
                  <Field id={`${uid}-tel`} label={T.phone} error={err('phone', 2)}>
                    <input id={`${uid}-tel`} type="tel" inputMode="tel" className="field" maxLength={MAX_LENGTH.phone} value={d.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" placeholder={T.phonePlaceholder} aria-invalid={!!err('phone', 2)} aria-describedby={err('phone', 2) ? `${uid}-tel-e` : undefined} />
                  </Field>
                </div>
                {/* Campo trampa contra bots: invisible y fuera del orden de tabulación. */}
                <div aria-hidden="true" className="sr-only">
                  <label htmlFor={`${uid}-hp`}>{T.trap}</label>
                  <input id={`${uid}-hp`} name="hp_ref" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
                </div>
              </div>
            )}

            {step === 3 && send.state === 'done' && (
              <div>
                <div role="status">
                  <p className="inline-flex items-center gap-2 bg-[#E7F6EF] px-2.5 py-1 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-[#1D7A53]"><Check aria-hidden className="h-3.5 w-3.5" />{T.folio} {send.folio}</p>
                  <h3 data-step-title tabIndex={-1} className="mt-3 font-display text-[1.6rem] font-semibold text-ink outline-none">{T.received}</h3>
                  <p className="mt-1.5 max-w-measure text-[0.95rem] text-body">{T.receivedText}</p>
                </div>
                <dl className="mt-6 divide-y divide-line border-y border-line text-[0.92rem]">
                  <Info label={T.folio}><span className="font-mono">{send.folio}</span></Info>
                  <Info label={T.date}>{send.fecha}</Info>
                  <Info label={T.service}>{send.sent.labels.join(', ')}</Info>
                </dl>
                {sent(send.estados.acuse) && <p className="mt-4 text-[0.88rem] text-muted">{T.ackSent(send.sent.request.email.trim())}</p>}
                {!sent(send.estados.correo) ? (
                  // Sólo llegó el WhatsApp: sin archivos y con la descripción resumida.
                  <div className="mt-6 bg-mist px-4 py-4 text-[0.88rem] text-muted">
                    <p>{T.onlyWhatsapp(send.folio)}</p>
                    <p className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                      <a href={waLink(quoteNotice(send.sent.request, { files: send.sent.files, folio: send.folio, date: send.fecha }))} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-medium text-ink hover:text-tech">
                        <MessageCircle aria-hidden className="h-4 w-4" /> {T.sendWhatsapp}
                      </a>
                      <a href={mailLink(`${T.folio} ${send.folio}`, quoteNotice(send.sent.request, { files: send.sent.files, folio: send.folio, date: send.fecha }))} className="inline-flex items-center gap-2 font-medium text-ink hover:text-tech">
                        <Mail aria-hidden className="h-4 w-4" /> {T.sendEmail}
                      </a>
                    </p>
                  </div>
                ) : !sent(send.estados.whatsapp) && (
                  <div className="mt-6 bg-mist px-4 py-4 text-[0.88rem] text-muted">
                    <p>{T.alsoWhatsapp}</p>
                    <a href={waLink(quoteNotice(send.sent.request, { files: send.sent.files, folio: send.folio, date: send.fecha }))} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 font-medium text-ink hover:text-tech">
                      <MessageCircle aria-hidden className="h-4 w-4" /> {T.notifyWhatsapp}
                    </a>
                  </div>
                )}
              </div>
            )}

            {step === 3 && send.state !== 'done' && (
              <div>
                <p className="inline-flex items-center gap-2 bg-[#E7F6EF] px-2.5 py-1 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-[#1D7A53]"><Check aria-hidden className="h-3.5 w-3.5" />{T.readyBadge}</p>
                <h3 data-step-title tabIndex={-1} className="mt-3 font-display text-[1.6rem] font-semibold text-ink outline-none">{T.reviewTitle}</h3>
                <p className="mt-1.5 text-[0.9rem] text-muted">{api ? T.reviewApi : T.reviewManual}</p>
                <dl className="mt-6 divide-y divide-line border-y border-line text-[0.92rem]">
                  <Row label={T.rowNeed} editLabel={T.editLabel(T.rowNeed)} edit={T.edit} onEdit={() => go(0)} disabled={sending}>{typeLabels.join(', ')}{context && <span className="block text-[0.82rem] text-muted">{T.reference} {context}</span>}</Row>
                  <Row label={T.rowProject} editLabel={T.editLabel(T.rowProject)} edit={T.edit} onEdit={() => go(1)} disabled={sending}>
                    <span className="block">{[d.site && siteLabel(d.site, locale), d.location].filter(Boolean).join(' · ')}</span>
                    <span className="mt-1 block whitespace-pre-line text-muted">{d.description}</span>
                    {summary && <span className="mt-1 block text-[0.82rem] text-muted"><Compass aria-hidden className="mr-1 inline h-3.5 w-3.5" />{T.summaryTitle}</span>}
                    {files.length > 0 && <span className="mt-1 block font-mono text-[0.78rem] text-muted">{T.filesCount(files.length, api)}: {fileNames.join(', ')}</span>}
                  </Row>
                  <Row label={T.rowContact} editLabel={T.editLabel(T.rowContact)} edit={T.edit} onEdit={() => go(2)} disabled={sending}>
                    <span className="block">{[d.name, d.role.trim(), d.company].filter(Boolean).join(' · ')}</span>
                    <span className="block text-muted">{d.email} · {d.phone}</span>
                  </Row>
                </dl>
                {api ? (
                  <>
                    <p role="status" className={cn('mt-6 flex items-center gap-2 text-[0.85rem]', send.state === 'error' ? 'text-[#B42318]' : 'text-muted')}>
                      <span aria-hidden className={cn('h-2 w-2 rounded-full', sending ? 'animate-pulse bg-tech' : send.state === 'error' ? 'bg-[#B42318]' : 'bg-[#1D7A53]')} />
                      {sending ? T.statusSending : send.state === 'error' ? T.statusError : T.statusIdle}
                    </p>
                    {send.state === 'error' && (
                      <div role="alert" className="mt-3 border-l-2 border-[#B42318] bg-mist px-4 py-3 text-[0.88rem]">
                        <p className="font-medium text-[#B42318]">{T.sendError}</p>
                        <p className="mt-1 text-muted">{send.message}{SUGGESTS_MANUAL.includes(send.code) ? '' : T.alsoManual}</p>
                      </div>
                    )}
                    <button type="button" onClick={submit} disabled={sending} aria-busy={sending} className="mt-4 inline-flex w-full items-center justify-center gap-2.5 rounded-[2px] bg-corp px-5 py-3.5 font-medium text-white transition-colors hover:bg-navy disabled:cursor-wait disabled:opacity-70">
                      <Send aria-hidden className="h-4 w-4" /> {sending ? T.sending : send.state === 'error' ? T.retry : T.send}
                    </button>
                    <p className="mt-3 text-[0.82rem] text-muted">{T.privacyPre} <Link to="/aviso-de-privacidad" className="text-ink link-line">{T.privacyLink}</Link>.</p>
                    <p className="mt-4 text-[0.85rem] text-muted">
                      {T.preferManual}{' '}
                      <a href={waLink(message)} onClick={() => lead('whatsapp')} target="_blank" rel="noopener noreferrer" aria-disabled={sending || undefined} tabIndex={sending ? -1 : undefined} className={cn('font-medium text-ink link-line', sending && 'pointer-events-none opacity-50')}>{T.sendWhatsapp}</a>
                      {' · '}
                      <a href={mailLink(subject, message)} onClick={() => lead('email')} aria-disabled={sending || undefined} tabIndex={sending ? -1 : undefined} className={cn('font-medium text-ink link-line', sending && 'pointer-events-none opacity-50')}>{T.sendEmail}</a>
                    </p>
                  </>
                ) : (
                <>
                <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  <a href={waLink(message)} onClick={() => lead('whatsapp')} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-2.5 rounded-[2px] bg-corp px-5 py-3.5 font-medium text-white transition-colors hover:bg-navy">
                    <MessageCircle aria-hidden className="h-4 w-4" /> {T.sendWhatsapp}
                  </a>
                  <a href={mailLink(subject, message)} onClick={() => lead('email')} className="inline-flex items-center justify-center gap-2.5 rounded-[2px] border border-navy px-5 py-3.5 font-medium text-ink transition-colors hover:bg-navy hover:text-white">
                    <Mail aria-hidden className="h-4 w-4" /> {T.sendEmail}
                  </a>
                </div>
                <p className="mt-3 text-[0.82rem] text-muted">{T.privacyPre} <Link to="/aviso-de-privacidad" className="text-ink link-line">{T.privacyLink}</Link>.</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-mist px-4 py-3 text-[0.85rem] text-muted">
                  <span>{T.noApp(COMPANY.whatsappDisplay, COMPANY.email)}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      if (await copyText(message)) { setCopyFailed(false); setCopied(true); window.setTimeout(() => setCopied(false), 2000); return }
                      setCopied(false)
                      setCopyFailed(true)
                      if (msgDetails.current) msgDetails.current.open = true
                      requestAnimationFrame(() => document.getElementById(`${uid}-msg`)?.focus())
                    }}
                    className="inline-flex items-center gap-2 font-medium text-ink hover:text-tech"
                  >
                    {copied ? <Check aria-hidden className="h-4 w-4" /> : <Copy aria-hidden className="h-4 w-4" />}
                    {copied ? t.common.copied : T.copyRequest}
                  </button>
                  <span className="sr-only" aria-live="polite">{copied ? T.requestCopied : ''}</span>
                  {copyFailed && <span role="alert" className="w-full text-[#B42318]">{T.copyFailed}</span>}
                </div>
                <details ref={msgDetails} className="mt-4 text-[0.85rem]">
                  <summary className="cursor-pointer text-muted hover:text-ink">{T.seeMessage}</summary>
                  <textarea id={`${uid}-msg`} readOnly rows={10} value={message} className="field mt-2 font-mono text-[0.78rem]" onFocus={(e) => e.currentTarget.select()} aria-label={T.messageLabel} />
                </details>
                </>
                )}
              </div>
            )}
          </m.div>
        </AnimatePresence>

        {/* navegación */}
        {send.state !== 'done' && (
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-5">
          {step > 0 ? (
            <button type="button" onClick={() => go(step - 1)} disabled={sending} className="inline-flex items-center gap-2 text-[0.92rem] text-muted hover:text-ink">
              <ArrowLeft aria-hidden className="h-4 w-4" /> {T.back}
            </button>
          ) : (
            <span className="font-mono text-[0.72rem] text-muted">{T.stepCounter(1, 4)}</span>
          )}
          {step < 3 && (
            <button type="button" onClick={next} className="group inline-flex items-center gap-2.5 rounded-[2px] bg-corp px-6 py-3 text-[0.95rem] font-medium text-white transition-[background-color,transform] hover:bg-navy active:scale-[0.98]">
              {step === 2 ? T.toReview : T.next}
            </button>
          )}
        </div>
        )}
        <p className="sr-only" aria-live="polite">{send.state === 'done' ? T.receivedLive(send.folio) : T.stepOf(step + 1, 4, T.steps[step])}</p>
      </div>
    </div>
  )
}

function SummaryBox({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="mt-5 border-l-2 border-tech bg-ice/60 px-4 py-3">
      <p className="flex items-center gap-2 text-[0.85rem] font-medium text-ink"><Compass aria-hidden className="h-4 w-4 text-tech" strokeWidth={1.75} />{title}</p>
      <ul className="mt-1.5 space-y-0.5 text-[0.85rem] text-body">{lines.map((l) => <li key={l}>{l}</li>)}</ul>
    </div>
  )
}

function Field({ id, label, error, hint, optional, children }: { id: string; label: string; error?: string; hint?: string; optional?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[0.88rem] font-medium text-ink">{label}{optional && <span className="font-normal text-muted"> {optional}</span>}</label>
      {children}
      {hint && !error && <p id={`${id}-h`} className="mt-1.5 text-[0.8rem] text-muted">{hint}</p>}
      {error && <p id={`${id}-e`} role="alert" className="mt-1.5 text-[0.82rem] text-[#B42318]">{error}</p>}
    </div>
  )
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 py-3.5 sm:grid-cols-[8rem_minmax(0,1fr)]">
      <dt className="pt-0.5 text-small text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{children}</dd>
    </div>
  )
}

function Row({ label, children, onEdit, disabled, edit, editLabel }: { label: string; children: ReactNode; onEdit: () => void; disabled?: boolean; edit: string; editLabel: string }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)_auto] gap-3 py-3.5 sm:grid-cols-[8rem_minmax(0,1fr)_auto]">
      <dt className="pt-0.5 text-small text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{children}</dd>
      <dd>
        <button type="button" onClick={onEdit} disabled={disabled} className="inline-flex items-center gap-1 text-[0.82rem] text-muted hover:text-tech disabled:cursor-not-allowed disabled:opacity-50" aria-label={editLabel}>
          <Pencil aria-hidden className="h-3.5 w-3.5" /> {edit}
        </button>
      </dd>
    </div>
  )
}
