import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Cable, Cctv, Check, Copy, DoorClosed, FileText, Mail, MessageCircle, Paperclip, Pencil, Plus, Send, Server, Spline, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { COMPANY } from '../../data/company'
import { QUOTE_TYPES, type QuoteType } from '../../data/solutions'
import { Link } from 'react-router-dom'
import { track } from '../../lib/analytics'
import { FILE_ACCEPT, FILES, MAX_LENGTH, SITES, fileExtension, quoteNotice, validateQuote, type QuoteRequest } from '../../lib/cotizacion'
import { cn, copyText, mailLink, waLink, useReducedMotion } from '../../lib/utils'

const ICONS: Record<QuoteType, typeof Cable> = { cableado: Cable, fibra: Spline, cctv: Cctv, acceso: DoorClosed, infra: Server, otro: Plus }
export { SITES }
const FREE_MAIL = /@(gmail|hotmail|outlook|live|yahoo|icloud|prodigy)\./i

type Data = Omit<QuoteRequest, 'context'>

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

const STEPS = ['Necesidad', 'Proyecto', 'Contacto', 'Revisión']

/** Identidad de un archivo: dos «plano.pdf» de carpetas distintas son archivos distintos. */
const fileId = (f: File) => `${f.name}:${f.size}:${f.lastModified}`

const MAX_MB = FILES.totalBytes / 1048576

const fmtSize = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

export function QuoteWizard({ initialType, context, initialDescription, initialSite }: { initialType?: QuoteType; context?: string; initialDescription?: string; initialSite?: string }) {
  const uid = useId().replace(/:/g, '')
  const reduce = useReducedMotion()
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
  /** Campo a enfocar al terminar la animación del cambio de paso (si no, se enfoca el título del paso). */
  const pendingFocus = useRef<string | null>(null)
  const startedAt = useRef(Date.now())
  const keyRef = useRef(newKey())
  const fileRef = useRef<HTMLInputElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const [d, setD] = useState<Data>({
    types: initialType ? [initialType] : [],
    site: initialSite ?? '',
    location: '',
    description: initialDescription ?? '',
    name: '',
    company: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    let live = true
    receptionActive().then((on) => live && setApi(on))
    return () => { live = false }
  }, [])
  // Cualquier cambio después de un intento fallido es un envío nuevo (otra clave, otro folio): se limpian
  // el aviso de error y los errores que marcó el servidor.
  useEffect(() => {
    keyRef.current = newKey()
    setServerErrors({})
    setSend((s) => (s.state === 'error' ? { state: 'idle' } : s))
  }, [d, files])

  const set = <K extends keyof Data>(k: K, v: Data[K]) => setD((s) => ({ ...s, [k]: v }))

  const request: QuoteRequest = useMemo(() => ({ ...d, context }), [d, context])
  const errors = useMemo(() => {
    const e = validateQuote(request) as Record<string, string>
    // Con descripción precargada (?necesidad=), el cliente debe agregar la suya.
    const own = initialDescription ? request.description.replace(initialDescription.trim(), '').trim() : null
    if (own !== null && !e.description && own.length < 15) e.description = 'Agregue los detalles de su proyecto (al menos 15 caracteres).'
    // Lo que rechazó el servidor tiene prioridad hasta que el cliente corrija el dato.
    return { ...e, ...serverErrors }
  }, [request, initialDescription, serverErrors])

  const stepFields: string[][] = [['types'], ['location', 'description'], ['name', 'company', 'email', 'phone'], []]
  const err = (f: string, i: number) => (tried[i] ? errors[f] : undefined)
  const fieldId: Record<string, string> = {
    types: `${uid}-t-${QUOTE_TYPES[0].id}`, location: `${uid}-loc`, description: `${uid}-desc`,
    name: `${uid}-name`, company: `${uid}-co`, email: `${uid}-mail`, phone: `${uid}-tel`, files: `${uid}-files`,
  }

  /** Cambia de paso; el foco pasa al título del paso nuevo (o a `focusField`) cuando termina la animación. */
  const go = (to: number, focusField?: string) => {
    pendingFocus.current = focusField ? fieldId[focusField] : null
    setStep(to)
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
    setTried((t) => ({ ...t, [step]: true }))
    // Con errores, el foco va al primer campo que hay que corregir.
    const bad = stepFields[step].find((f) => errors[f])
    if (bad) return requestAnimationFrame(() => document.getElementById(fieldId[bad])?.focus())
    if (step === 1 && api && fileError) return document.getElementById(fieldId.files)?.focus()
    go(step + 1)
  }

  const typeLabels = d.types.map((t) => QUOTE_TYPES.find((q) => q.id === t)!.label)
  const fileNames = files.map((f) => f.name)
  // Mismo formato que el aviso que recibe ventas por WhatsApp (src/lib/cotizacion.ts).
  const message = quoteNotice(request, { files: fileNames })

  /** Con envío automático se revisan tipo, cantidad y tamaño, porque los archivos viajan con la solicitud. */
  const checkFiles = (list: File[]) => {
    const bad = list.find((f) => !FILES.extensions.includes(fileExtension(f.name)))
    if (bad) return `«${bad.name}» no es de un tipo permitido (PDF, DWG/DXF, imágenes, Word o Excel).`
    if (list.length > FILES.max) return `Puede adjuntar hasta ${FILES.max} archivos.`
    if (list.reduce((sum, f) => sum + f.size, 0) > FILES.totalBytes) return `Los archivos suman más de ${MAX_MB} MB. Envíe los más grandes por WhatsApp o correo después de recibir su folio.`
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

  const submit = async () => {
    if (send.state === 'sending') return
    setSend({ state: 'sending' })
    const sentCopy = { request, labels: typeLabels, files: fileNames }
    const body = new FormData()
    d.types.forEach((t) => body.append('types', t))
    for (const k of ['site', 'location', 'description', 'name', 'company', 'email', 'phone'] as const) body.append(k, d[k].trim())
    if (context) body.append('context', context)
    body.append('key', keyRef.current)
    body.append('elapsed', String(Date.now() - startedAt.current))
    body.append('hp_ref', trap)
    files.forEach((f) => body.append('files', f, f.name))
    // AbortController + setTimeout en lugar de AbortSignal.timeout, que no existe en Safari/iOS anteriores a 16.
    const ctrl = new AbortController()
    const timer = window.setTimeout(() => ctrl.abort(), 60_000)
    try {
      const res = await fetch('/api/cotizacion', { method: 'POST', body, signal: ctrl.signal })
      const json = await res.json().catch(() => null)
      if (res.ok && json?.ok) {
        setStep(3)
        setSend({ state: 'done', folio: json.folio, fecha: json.fecha, estados: json.estados, sent: sentCopy })
        track('generate_lead', { method: 'formulario', need: d.types.join(',') })
        return
      }
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
      setSend({ state: 'error', code: json?.codigo ?? `http_${res.status}`, message: json?.mensaje ?? 'El servidor no pudo recibir la solicitud.' })
    } catch {
      // Si se agotó el tiempo, la solicitud pudo haber llegado: reintentar con la misma clave no la duplica.
      setSend(ctrl.signal.aborted
        ? { state: 'error', code: 'tiempo', message: 'No pudimos confirmar el envío. Pulse «Intentar de nuevo»: si ya había llegado, no se duplicará.' }
        : { state: 'error', code: 'red', message: 'No hubo conexión con el servidor.' })
    } finally {
      window.clearTimeout(timer)
    }
    requestAnimationFrame(() => topRef.current?.focus())
  }
  const sending = send.state === 'sending'
  const sent = (s: Status) => s === 'enviado' || s === 'prueba'

  // Mientras el cotizador está en pantalla se oculta el botón flotante de WhatsApp (WhatsAppButton).
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => document.documentElement.toggleAttribute('data-cotizador', e.isIntersecting))
    io.observe(el)
    return () => { io.disconnect(); document.documentElement.removeAttribute('data-cotizador') }
  }, [])

  const subject = `Solicitud de cotización · ${typeLabels[0] ?? 'Proyecto'} · ${d.company.trim() || 'Empresa'}`

  return (
    <div ref={root} className="border border-line bg-paper shadow-[0_1px_0_rgba(18,21,24,0.04)]">
      {/* progreso */}
      <ol className="flex border-b border-line" aria-label="Progreso de la solicitud">
        {STEPS.map((s, i) => (
          <li key={s} className={cn('relative flex-1 px-3 py-3.5 sm:px-5', i > 0 && 'border-l border-line')} aria-current={i === step ? 'step' : undefined}>
            <span className={cn('font-mono text-[0.68rem] tracking-[0.1em]', i === step ? 'text-tech' : i < step ? 'text-ink' : 'text-slate-muted')}>
              {i < step ? <Check aria-hidden className="mb-0.5 inline h-3 w-3" /> : `0${i + 1}`}
            </span>
            <span className={cn('ml-2 hidden text-[0.86rem] sm:inline', i === step ? 'font-medium text-ink' : 'text-slate-muted')}>{s}</span>
            <span aria-hidden className={cn('absolute inset-x-0 bottom-0 h-[2px] transition-colors', i <= step ? 'bg-tech' : 'bg-transparent')} />
          </li>
        ))}
      </ol>

      <div ref={topRef} tabIndex={-1} className="outline-none p-5 sm:p-8">
        <AnimatePresence mode="wait" initial={false} onExitComplete={focusStep}>
          <motion.div
            key={send.state === 'done' ? 'recibida' : step}
            initial={reduce ? false : { opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -10 }}
            transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {step === 0 && (
              <fieldset>
                <legend data-step-title tabIndex={-1} className="font-display text-[1.6rem] font-semibold text-ink outline-none">¿Qué necesita implementar?</legend>
                <p className="mt-1.5 text-[0.9rem] text-slate-muted">Puede elegir más de una opción.</p>
                {context && <p className="mt-3 inline-block bg-cold px-2.5 py-1 font-mono text-[0.75rem] text-ink">Desde: {context}</p>}
                <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {QUOTE_TYPES.map((q) => {
                    const Icon = ICONS[q.id]
                    const on = d.types.includes(q.id)
                    return (
                      <label key={q.id} className={cn('group relative flex cursor-pointer items-start gap-3 border p-4 transition-colors', on ? 'border-corp bg-corp text-white' : 'border-line hover:border-tech')}>
                        <input
                          type="checkbox"
                          id={`${uid}-t-${q.id}`}
                          className="peer sr-only"
                          checked={on}
                          onChange={() => set('types', on ? d.types.filter((t) => t !== q.id) : [...d.types, q.id])}
                        />
                        <Icon aria-hidden className={cn('mt-0.5 h-5 w-5 shrink-0', on ? 'text-tech' : 'text-ink')} strokeWidth={1.6} />
                        <span className="min-w-0">
                          <span className="block font-medium leading-tight">{q.label}</span>
                          <span className={cn('mt-1 block text-[0.8rem] leading-snug', on ? 'text-white/70' : 'text-slate-muted')}>{q.hint}</span>
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
                <h3 data-step-title tabIndex={-1} className="font-display text-[1.6rem] font-semibold text-ink outline-none">Sobre el proyecto</h3>
                <p className="mt-1.5 text-[0.9rem] text-slate-muted">Lo suficiente para preparar el levantamiento.</p>
                <div className="mt-6 grid gap-5">
                  <fieldset>
                    <legend className="mb-2 text-[0.88rem] font-medium text-ink">Tipo de inmueble <span className="font-normal text-slate-muted">(opcional)</span></legend>
                    <div className="flex flex-wrap gap-2">
                      {SITES.map((s) => (
                        <button key={s} type="button" aria-pressed={d.site === s} onClick={() => set('site', d.site === s ? '' : s)} className={cn('rounded-[2px] border px-3.5 py-2 text-[0.9rem] transition-colors', d.site === s ? 'border-corp bg-corp text-white' : 'border-line hover:border-tech')}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <Field id={`${uid}-loc`} label="Ciudad o ubicación general" error={err('location', 1)}>
                    <input id={`${uid}-loc`} className="field" maxLength={MAX_LENGTH.location} value={d.location} onChange={(e) => set('location', e.target.value)} placeholder="Ej. Apodaca, N.L. · Parque industrial" aria-invalid={!!err('location', 1)} aria-describedby={err('location', 1) ? `${uid}-loc-e` : undefined} autoComplete="address-level2" />
                  </Field>
                  <Field id={`${uid}-desc`} label="Describa la necesidad" error={err('description', 1)} hint="Áreas, cantidades aproximadas, plazos o equipo existente.">
                    <textarea id={`${uid}-desc`} rows={4} className="field resize-y" maxLength={MAX_LENGTH.description} value={d.description} onChange={(e) => set('description', e.target.value)} placeholder="Ej. Necesitamos conectar una nave nueva a 180 m del site principal, con WiFi para escáneres y 8 cámaras en andenes." aria-invalid={!!err('description', 1)} aria-describedby={err('description', 1) ? `${uid}-desc-e` : `${uid}-desc-h`} />
                  </Field>
                  <div>
                    <p className="text-[0.88rem] font-medium text-ink">Planos, fotografías o documentos <span className="font-normal text-slate-muted">(opcional)</span></p>
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
                    <label htmlFor={`${uid}-files`} className="mt-2 flex cursor-pointer items-center gap-3 border border-dashed border-line bg-cold px-4 py-4 text-[0.9rem] text-ink transition-colors hover:border-tech peer-focus-visible:ring-2 peer-focus-visible:ring-lumen peer-focus-visible:ring-offset-2">
                      <Paperclip aria-hidden className="h-4 w-4" />
                      <span>Seleccionar archivos <span className="text-slate-muted">· PDF, DWG/DXF, imágenes, Word o Excel</span></span>
                    </label>
                    {files.length > 0 && (
                      <ul className="mt-2 divide-y divide-line border border-line">
                        {files.map((f) => (
                          <li key={fileId(f)} className="flex items-center justify-between gap-3 px-3 py-2 text-[0.85rem]">
                            <span className="flex min-w-0 items-center gap-2"><FileText aria-hidden className="h-4 w-4 shrink-0 text-slate-faint" /><span className="truncate">{f.name}</span></span>
                            <span className="flex shrink-0 items-center gap-3 font-mono text-[0.75rem] text-slate-muted">
                              {fmtSize(f.size)}
                              <button type="button" aria-label={`Quitar ${f.name}`} onClick={() => { setFiles(files.filter((x) => fileId(x) !== fileId(f))); setFileError(undefined) }} className="text-slate-faint hover:text-tech"><X className="h-4 w-4" /></button>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {fileError && <p role="alert" className="mt-2 text-[0.82rem] text-[#B42318]">{fileError}</p>}
                    <p className="mt-2 font-mono text-[0.72rem] leading-snug text-slate-muted">
                      {api
                        ? `Se envían con su solicitud y llegan adjuntos al correo del equipo comercial. Hasta ${FILES.max} archivos y ${MAX_MB} MB en total.`
                        : 'Por ahora los archivos no se envían a ningún servidor: se listan en la solicitud para adjuntarlos en WhatsApp o correo.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 data-step-title tabIndex={-1} className="font-display text-[1.6rem] font-semibold text-ink outline-none">¿Con quién hablamos?</h3>
                <p className="mt-1.5 text-[0.9rem] text-slate-muted">Sólo para dar seguimiento a esta solicitud.</p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field id={`${uid}-name`} label="Nombre" error={err('name', 2)}>
                    <input id={`${uid}-name`} className="field" maxLength={MAX_LENGTH.name} value={d.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" aria-invalid={!!err('name', 2)} aria-describedby={err('name', 2) ? `${uid}-name-e` : undefined} />
                  </Field>
                  <Field id={`${uid}-co`} label="Empresa" error={err('company', 2)}>
                    <input id={`${uid}-co`} className="field" maxLength={MAX_LENGTH.company} value={d.company} onChange={(e) => set('company', e.target.value)} autoComplete="organization" aria-invalid={!!err('company', 2)} aria-describedby={err('company', 2) ? `${uid}-co-e` : undefined} />
                  </Field>
                  <Field id={`${uid}-mail`} label="Correo corporativo" error={err('email', 2)} hint={!err('email', 2) && FREE_MAIL.test(d.email) ? 'Si tiene correo de la empresa, nos ayuda a identificar el proyecto.' : undefined}>
                    <input id={`${uid}-mail`} type="email" inputMode="email" className="field" maxLength={MAX_LENGTH.email} value={d.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" placeholder="nombre@empresa.com" aria-invalid={!!err('email', 2)} aria-describedby={err('email', 2) ? `${uid}-mail-e` : FREE_MAIL.test(d.email) ? `${uid}-mail-h` : undefined} />
                  </Field>
                  <Field id={`${uid}-tel`} label="WhatsApp" error={err('phone', 2)}>
                    <input id={`${uid}-tel`} type="tel" inputMode="tel" className="field" maxLength={MAX_LENGTH.phone} value={d.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" placeholder="81 0000 0000" aria-invalid={!!err('phone', 2)} aria-describedby={err('phone', 2) ? `${uid}-tel-e` : undefined} />
                  </Field>
                </div>
                {/* Campo trampa contra bots: invisible y fuera del orden de tabulación. */}
                <div aria-hidden="true" className="sr-only">
                  <label htmlFor={`${uid}-hp`}>Referencia interna</label>
                  <input id={`${uid}-hp`} name="hp_ref" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
                </div>
              </div>
            )}

            {step === 3 && send.state === 'done' && (
              <div>
                <div role="status">
                  <p className="inline-flex items-center gap-2 bg-[#E7F6EF] px-2.5 py-1 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-[#1D7A53]"><Check aria-hidden className="h-3.5 w-3.5" />Folio {send.folio}</p>
                  <h3 data-step-title tabIndex={-1} className="mt-3 font-display text-[1.6rem] font-semibold text-ink outline-none">Solicitud recibida</h3>
                  <p className="mt-1.5 max-w-measure text-[0.95rem] text-body">Gracias por contactar a Interfaz Redes y Telecomunicaciones. Nuestro equipo comercial revisará la información de su proyecto para dar seguimiento a su solicitud.</p>
                </div>
                <dl className="mt-6 divide-y divide-line border-y border-line text-[0.92rem]">
                  <Info label="Folio"><span className="font-mono">{send.folio}</span></Info>
                  <Info label="Fecha">{send.fecha}</Info>
                  <Info label="Servicio">{send.sent.labels.join(', ')}</Info>
                </dl>
                {sent(send.estados.acuse) && <p className="mt-4 text-[0.88rem] text-slate-muted">Enviamos un acuse de recibo a <span className="text-ink">{send.sent.request.email.trim()}</span>.</p>}
                {!sent(send.estados.correo) ? (
                  // Sólo llegó el WhatsApp: sin archivos y con la descripción resumida.
                  <div className="mt-6 bg-cold px-4 py-4 text-[0.88rem] text-slate-muted">
                    <p>Su solicitud llegó al equipo por WhatsApp, pero sin archivos y con la descripción resumida. Envíe los archivos y el detalle por correo o WhatsApp citando el folio <span className="font-mono text-ink">{send.folio}</span>.</p>
                    <p className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                      <a href={waLink(quoteNotice(send.sent.request, { files: send.sent.files, folio: send.folio, date: send.fecha }))} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-medium text-ink hover:text-tech">
                        <MessageCircle aria-hidden className="h-4 w-4" /> Enviar por WhatsApp
                      </a>
                      <a href={mailLink(`Folio ${send.folio} · archivos y detalle de la solicitud`, quoteNotice(send.sent.request, { files: send.sent.files, folio: send.folio, date: send.fecha }))} className="inline-flex items-center gap-2 font-medium text-ink hover:text-tech">
                        <Mail aria-hidden className="h-4 w-4" /> Enviar por correo
                      </a>
                    </p>
                  </div>
                ) : !sent(send.estados.whatsapp) && (
                  <div className="mt-6 bg-cold px-4 py-4 text-[0.88rem] text-slate-muted">
                    <p>Si lo desea, avísenos también por WhatsApp. Se abre WhatsApp con su folio y la solicitud escrita; usted confirma el envío.</p>
                    <a href={waLink(quoteNotice(send.sent.request, { files: send.sent.files, folio: send.folio, date: send.fecha }))} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 font-medium text-ink hover:text-tech">
                      <MessageCircle aria-hidden className="h-4 w-4" /> Enviar aviso por WhatsApp
                    </a>
                  </div>
                )}
              </div>
            )}

            {step === 3 && send.state !== 'done' && (
              <div>
                <p className="inline-flex items-center gap-2 bg-[#E7F6EF] px-2.5 py-1 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-[#1D7A53]"><Check aria-hidden className="h-3.5 w-3.5" />Solicitud lista para enviar</p>
                <h3 data-step-title tabIndex={-1} className="mt-3 font-display text-[1.6rem] font-semibold text-ink outline-none">Revise su solicitud</h3>
                <p className="mt-1.5 text-[0.9rem] text-slate-muted">{api ? 'Revise los datos y envíe la solicitud. Al recibirla le mostraremos su folio.' : 'Al elegir un canal se abre con el mensaje escrito. El envío se completa en esa aplicación.'}</p>
                <dl className="mt-6 divide-y divide-line border-y border-line text-[0.92rem]">
                  <Row label="Necesidad" onEdit={() => go(0)} disabled={sending}>{typeLabels.join(', ')}{context && <span className="block text-[0.82rem] text-slate-muted">Referencia: {context}</span>}</Row>
                  <Row label="Proyecto" onEdit={() => go(1)} disabled={sending}>
                    <span className="block">{[d.site, d.location].filter(Boolean).join(' · ')}</span>
                    <span className="mt-1 block whitespace-pre-line text-slate-muted">{d.description}</span>
                    {files.length > 0 && <span className="mt-1 block font-mono text-[0.78rem] text-slate-muted">{files.length} archivo(s) {api ? 'adjunto(s)' : 'por adjuntar'}: {fileNames.join(', ')}</span>}
                  </Row>
                  <Row label="Contacto" onEdit={() => go(2)} disabled={sending}>
                    <span className="block">{d.name} · {d.company}</span>
                    <span className="block text-slate-muted">{d.email} · {d.phone}</span>
                  </Row>
                </dl>
                {api ? (
                  <>
                    {send.state === 'error' && (
                      <div role="alert" className="mt-6 border-l-2 border-[#B42318] bg-cold px-4 py-3 text-[0.88rem]">
                        <p className="font-medium text-[#B42318]">No se pudo enviar la solicitud.</p>
                        <p className="mt-1 text-slate-muted">{send.message}{SUGGESTS_MANUAL.includes(send.code) ? '' : ' También puede enviarla usted mismo por WhatsApp o correo.'}</p>
                      </div>
                    )}
                    <button type="button" onClick={submit} disabled={sending} aria-busy={sending} className="mt-6 inline-flex w-full items-center justify-center gap-2.5 rounded-[2px] bg-corp px-5 py-3.5 font-medium text-white transition-colors hover:bg-navy disabled:cursor-wait disabled:opacity-70">
                      <Send aria-hidden className="h-4 w-4" /> {sending ? 'Enviando solicitud…' : send.state === 'error' ? 'Intentar de nuevo' : 'Enviar solicitud'}
                    </button>
                    <p className="mt-3 text-[0.82rem] text-slate-muted">Al enviar su solicitud acepta el <Link to="/aviso-de-privacidad" className="text-ink link-line">aviso de privacidad</Link>.</p>
                    <p className="mt-4 text-[0.85rem] text-slate-muted">
                      ¿Prefiere enviarla usted mismo?{' '}
                      <a href={waLink(message)} onClick={() => track('generate_lead', { method: 'whatsapp', need: d.types.join(',') })} target="_blank" rel="noopener noreferrer" aria-disabled={sending || undefined} tabIndex={sending ? -1 : undefined} className={cn('font-medium text-ink link-line', sending && 'pointer-events-none opacity-50')}>Enviar por WhatsApp</a>
                      {' · '}
                      <a href={mailLink(subject, message)} onClick={() => track('generate_lead', { method: 'email', need: d.types.join(',') })} aria-disabled={sending || undefined} tabIndex={sending ? -1 : undefined} className={cn('font-medium text-ink link-line', sending && 'pointer-events-none opacity-50')}>Enviar por correo</a>
                    </p>
                  </>
                ) : (
                <>
                <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  <a href={waLink(message)} onClick={() => track('generate_lead', { method: 'whatsapp', need: d.types.join(',') })} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-2.5 rounded-[2px] bg-corp px-5 py-3.5 font-medium text-white transition-colors hover:bg-navy">
                    <MessageCircle aria-hidden className="h-4 w-4" /> Enviar por WhatsApp
                  </a>
                  <a href={mailLink(subject, message)} onClick={() => track('generate_lead', { method: 'email', need: d.types.join(',') })} className="inline-flex items-center justify-center gap-2.5 rounded-[2px] border border-navy px-5 py-3.5 font-medium text-ink transition-colors hover:bg-navy hover:text-white">
                    <Mail aria-hidden className="h-4 w-4" /> Enviar por correo
                  </a>
                </div>
                <p className="mt-3 text-[0.82rem] text-slate-muted">Al enviar su solicitud acepta el <Link to="/aviso-de-privacidad" className="text-ink link-line">aviso de privacidad</Link>.</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-cold px-4 py-3 text-[0.85rem] text-slate-muted">
                  <span>¿No se abrió la aplicación? Copie la solicitud y envíela a <span className="select-all text-ink">{COMPANY.whatsappDisplay}</span> o <span className="select-all text-ink">{COMPANY.email}</span>.</span>
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
                    {copied ? 'Copiado' : 'Copiar solicitud'}
                  </button>
                  <span className="sr-only" aria-live="polite">{copied ? 'Solicitud copiada' : ''}</span>
                  {copyFailed && <span role="alert" className="w-full text-[#B42318]">No se pudo copiar automáticamente; seleccione el texto del mensaje de abajo.</span>}
                </div>
                <details ref={msgDetails} className="mt-4 text-[0.85rem]">
                  <summary className="cursor-pointer text-slate-muted hover:text-ink">Ver el mensaje que se enviará</summary>
                  <textarea id={`${uid}-msg`} readOnly rows={10} value={message} className="field mt-2 font-mono text-[0.78rem]" onFocus={(e) => e.currentTarget.select()} aria-label="Mensaje de la solicitud" />
                </details>
                </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* navegación */}
        {send.state !== 'done' && (
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-5">
          {step > 0 ? (
            <button type="button" onClick={() => go(step - 1)} disabled={sending} className="inline-flex items-center gap-2 text-[0.92rem] text-slate-muted hover:text-ink">
              <ArrowLeft aria-hidden className="h-4 w-4" /> Atrás
            </button>
          ) : (
            <span className="font-mono text-[0.72rem] text-slate-muted">Paso 1 de 4</span>
          )}
          {step < 3 && (
            <button type="button" onClick={next} className="group inline-flex items-center gap-2.5 rounded-[2px] bg-corp px-6 py-3 text-[0.95rem] font-medium text-white transition-colors hover:bg-navy">
              {step === 2 ? 'Revisar solicitud' : 'Continuar'}
            </button>
          )}
        </div>
        )}
        <p className="sr-only" aria-live="polite">{send.state === 'done' ? `Solicitud recibida. Folio ${send.folio}` : `Paso ${step + 1} de 4: ${STEPS[step]}`}</p>
      </div>
    </div>
  )
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[0.88rem] font-medium text-ink">{label}</label>
      {children}
      {hint && !error && <p id={`${id}-h`} className="mt-1.5 text-[0.8rem] text-slate-muted">{hint}</p>}
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

function Row({ label, children, onEdit, disabled }: { label: string; children: ReactNode; onEdit: () => void; disabled?: boolean }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)_auto] gap-3 py-3.5 sm:grid-cols-[8rem_minmax(0,1fr)_auto]">
      <dt className="pt-0.5 text-small text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{children}</dd>
      <dd>
        <button type="button" onClick={onEdit} disabled={disabled} className="inline-flex items-center gap-1 text-[0.82rem] text-slate-muted hover:text-tech disabled:cursor-not-allowed disabled:opacity-50" aria-label={`Editar ${label.toLowerCase()}`}>
          <Pencil aria-hidden className="h-3.5 w-3.5" /> Editar
        </button>
      </dd>
    </div>
  )
}
