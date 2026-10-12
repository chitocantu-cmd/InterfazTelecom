import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, Cable, Cctv, Check, Copy, DoorClosed, FileText, Mail, MessageCircle, Paperclip, Pencil, Plus, Server, Spline, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { COMPANY } from '../../data/company'
import { QUOTE_TYPES, type QuoteType } from '../../data/solutions'
import { Link } from 'react-router-dom'
import { track } from '../../lib/analytics'
import { cn, copyText, mailLink, waLink } from '../../lib/utils'

const ICONS: Record<QuoteType, typeof Cable> = { cableado: Cable, fibra: Spline, cctv: Cctv, acceso: DoorClosed, infra: Server, otro: Plus }
export const SITES = ['Planta industrial', 'Oficinas / corporativo', 'CEDIS / almacén', 'Institución educativa', 'Comercio / edificio', 'Otro']
const FREE_MAIL = /@(gmail|hotmail|outlook|live|yahoo|icloud|prodigy)\./i

interface Data {
  types: QuoteType[]
  site: string
  location: string
  description: string
  name: string
  company: string
  email: string
  phone: string
}

interface FileItem { name: string; size: number }

const STEPS = ['Necesidad', 'Proyecto', 'Contacto', 'Revisión']

const fmtSize = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

export function QuoteWizard({ initialType, context, initialDescription, initialSite }: { initialType?: QuoteType; context?: string; initialDescription?: string; initialSite?: string }) {
  const uid = useId().replace(/:/g, '')
  const reduce = useReducedMotion()
  const [step, setStep] = useState(0)
  const [tried, setTried] = useState<Record<number, boolean>>({})
  const [files, setFiles] = useState<FileItem[]>([])
  const [copied, setCopied] = useState(false)
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
    setD((v) => ({ ...v, types: initialType ? [initialType] : v.types, description: initialDescription ?? v.description, site: initialSite ?? v.site }))
  }, [initialType, initialDescription, initialSite])

  const set = <K extends keyof Data>(k: K, v: Data[K]) => setD((s) => ({ ...s, [k]: v }))

  const errors = useMemo(() => {
    const e: Record<string, string> = {}
    if (!d.types.length) e.types = 'Seleccione al menos una opción.'
    if (d.location.trim().length < 3) e.location = 'Indique la ciudad o zona del proyecto.'
    if (d.description.trim().length < 15) e.description = 'Describa la necesidad en al menos una frase (15 caracteres).'
    if (d.name.trim().length < 3) e.name = 'Escriba su nombre.'
    if (d.company.trim().length < 2) e.company = 'Escriba el nombre de la empresa.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) e.email = 'Revise el formato del correo, por ejemplo nombre@empresa.com.'
    if (d.phone.replace(/\D/g, '').length < 10) e.phone = 'Escriba un número de 10 dígitos.'
    return e
  }, [d])

  const stepFields: string[][] = [['types'], ['location', 'description'], ['name', 'company', 'email', 'phone'], []]
  const stepValid = (i: number) => stepFields[i].every((f) => !errors[f])
  const err = (f: string, i: number) => (tried[i] ? errors[f] : undefined)

  const go = (to: number) => {
    setStep(to)
    requestAnimationFrame(() => {
      const el = topRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.top < 130 || r.top > window.innerHeight * 0.5) window.scrollTo({ top: window.scrollY + r.top - 150, behavior: reduce ? 'auto' : 'smooth' })
      el.focus({ preventScroll: true })
    })
  }
  const next = () => {
    setTried((t) => ({ ...t, [step]: true }))
    if (stepValid(step)) go(step + 1)
  }

  const typeLabels = d.types.map((t) => QUOTE_TYPES.find((q) => q.id === t)!.label)
  const message = [
    'Hola, solicito una cotización a Interfaz Redes y Telecomunicaciones.',
    '',
    `• Necesidad: ${typeLabels.join(', ') || '—'}`,
    context ? `• Referencia: ${context}` : null,
    d.site ? `• Tipo de inmueble: ${d.site}` : null,
    `• Ubicación: ${d.location.trim() || '—'}`,
    `• Descripción: ${d.description.trim() || '—'}`,
    files.length ? `• Archivos para compartir: ${files.map((f) => f.name).join(', ')}` : null,
    '',
    `Nombre: ${d.name.trim()}`,
    `Empresa: ${d.company.trim()}`,
    `Correo: ${d.email.trim()}`,
    `WhatsApp: ${d.phone.trim()}`,
  ]
    .filter((l) => l !== null)
    .join('\n')

  const subject = `Solicitud de cotización · ${typeLabels[0] ?? 'Proyecto'} · ${d.company.trim() || 'Empresa'}`

  return (
    <div className="border border-line bg-paper shadow-[0_1px_0_rgba(18,21,24,0.04)]">
      {/* progreso */}
      <div className="flex border-b border-line" aria-label="Progreso de la solicitud">
        {STEPS.map((s, i) => (
          <div key={s} className={cn('relative flex-1 px-3 py-3.5 sm:px-5', i > 0 && 'border-l border-line')} aria-current={i === step ? 'step' : undefined}>
            <span className={cn('font-mono text-[0.68rem] tracking-[0.1em]', i === step ? 'text-tech' : i < step ? 'text-ink' : 'text-slate-faint')}>
              {i < step ? <Check aria-hidden className="mb-0.5 inline h-3 w-3" /> : `0${i + 1}`}
            </span>
            <span className={cn('ml-2 hidden text-[0.86rem] sm:inline', i === step ? 'font-medium text-ink' : 'text-slate-muted')}>{s}</span>
            <span aria-hidden className={cn('absolute inset-x-0 bottom-0 h-[2px] transition-colors', i <= step ? 'bg-tech' : 'bg-transparent')} />
          </div>
        ))}
      </div>

      <div ref={topRef} tabIndex={-1} className="outline-none p-5 sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={reduce ? false : { opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -10 }}
            transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {step === 0 && (
              <fieldset>
                <legend className="font-display text-[1.6rem] font-semibold text-ink">¿Qué necesita implementar?</legend>
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
                <h3 className="font-display text-[1.6rem] font-semibold text-ink">Sobre el proyecto</h3>
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
                    <input id={`${uid}-loc`} className="field" value={d.location} onChange={(e) => set('location', e.target.value)} placeholder="Ej. Apodaca, N.L. · Parque industrial" aria-invalid={!!err('location', 1)} aria-describedby={err('location', 1) ? `${uid}-loc-e` : undefined} autoComplete="address-level2" />
                  </Field>
                  <Field id={`${uid}-desc`} label="Describa la necesidad" error={err('description', 1)} hint="Áreas, cantidades aproximadas, plazos o equipo existente.">
                    <textarea id={`${uid}-desc`} rows={4} className="field resize-y" value={d.description} onChange={(e) => set('description', e.target.value)} placeholder="Ej. Necesitamos conectar una nave nueva a 180 m del site principal, con WiFi para escáneres y 8 cámaras en andenes." aria-invalid={!!err('description', 1)} aria-describedby={`${uid}-desc-h${err('description', 1) ? ` ${uid}-desc-e` : ''}`} />
                  </Field>
                  <div>
                    <p className="text-[0.88rem] font-medium text-ink">Planos, fotografías o documentos <span className="font-normal text-slate-muted">(opcional)</span></p>
                    <input
                      ref={fileRef}
                      id={`${uid}-files`}
                      type="file"
                      multiple
                      accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.heic,.xlsx,.docx"
                      className="sr-only"
                      onChange={(e) => {
                        const list = Array.from(e.target.files ?? []).map((f) => ({ name: f.name, size: f.size }))
                        setFiles((cur) => [...cur, ...list.filter((n) => !cur.some((c) => c.name === n.name))])
                        e.target.value = ''
                      }}
                    />
                    <label htmlFor={`${uid}-files`} className="mt-2 flex cursor-pointer items-center gap-3 border border-dashed border-line bg-cold px-4 py-4 text-[0.9rem] text-ink transition-colors hover:border-tech">
                      <Paperclip aria-hidden className="h-4 w-4" />
                      <span>Seleccionar archivos <span className="text-slate-muted">· PDF, DWG, imágenes</span></span>
                    </label>
                    {files.length > 0 && (
                      <ul className="mt-2 divide-y divide-line border border-line">
                        {files.map((f) => (
                          <li key={f.name} className="flex items-center justify-between gap-3 px-3 py-2 text-[0.85rem]">
                            <span className="flex min-w-0 items-center gap-2"><FileText aria-hidden className="h-4 w-4 shrink-0 text-slate-faint" /><span className="truncate">{f.name}</span></span>
                            <span className="flex shrink-0 items-center gap-3 font-mono text-[0.75rem] text-slate-muted">
                              {fmtSize(f.size)}
                              <button type="button" aria-label={`Quitar ${f.name}`} onClick={() => setFiles(files.filter((x) => x.name !== f.name))} className="text-slate-faint hover:text-tech"><X className="h-4 w-4" /></button>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-2 font-mono text-[0.72rem] leading-snug text-slate-muted">En este demo los archivos no se envían a ningún servidor. Se listan en la solicitud para adjuntarlos en WhatsApp o correo.</p>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="font-display text-[1.6rem] font-semibold text-ink">¿Con quién hablamos?</h3>
                <p className="mt-1.5 text-[0.9rem] text-slate-muted">Sólo para dar seguimiento a esta solicitud.</p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field id={`${uid}-name`} label="Nombre" error={err('name', 2)}>
                    <input id={`${uid}-name`} className="field" value={d.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" aria-invalid={!!err('name', 2)} aria-describedby={err('name', 2) ? `${uid}-name-e` : undefined} />
                  </Field>
                  <Field id={`${uid}-co`} label="Empresa" error={err('company', 2)}>
                    <input id={`${uid}-co`} className="field" value={d.company} onChange={(e) => set('company', e.target.value)} autoComplete="organization" aria-invalid={!!err('company', 2)} aria-describedby={err('company', 2) ? `${uid}-co-e` : undefined} />
                  </Field>
                  <Field id={`${uid}-mail`} label="Correo corporativo" error={err('email', 2)} hint={!err('email', 2) && FREE_MAIL.test(d.email) ? 'Si tiene correo de la empresa, nos ayuda a identificar el proyecto.' : undefined}>
                    <input id={`${uid}-mail`} type="email" inputMode="email" className="field" value={d.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" placeholder="nombre@empresa.com" aria-invalid={!!err('email', 2)} aria-describedby={err('email', 2) ? `${uid}-mail-e` : `${uid}-mail-h`} />
                  </Field>
                  <Field id={`${uid}-tel`} label="WhatsApp" error={err('phone', 2)}>
                    <input id={`${uid}-tel`} type="tel" inputMode="tel" className="field" value={d.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" placeholder="81 0000 0000" aria-invalid={!!err('phone', 2)} aria-describedby={err('phone', 2) ? `${uid}-tel-e` : undefined} />
                  </Field>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <p className="inline-flex items-center gap-2 bg-[#E7F6EF] px-2.5 py-1 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-[#1D7A53]"><Check aria-hidden className="h-3.5 w-3.5" />Solicitud lista para enviar</p>
                <h3 className="mt-3 font-display text-[1.6rem] font-semibold text-ink">Revise su solicitud</h3>
                <p className="mt-1.5 text-[0.9rem] text-slate-muted">Al elegir un canal se abre con el mensaje escrito. El envío se completa en esa aplicación.</p>
                <dl className="mt-6 divide-y divide-line border-y border-line text-[0.92rem]">
                  <Row label="Necesidad" onEdit={() => go(0)}>{typeLabels.join(', ')}{context && <span className="block text-[0.82rem] text-slate-muted">Referencia: {context}</span>}</Row>
                  <Row label="Proyecto" onEdit={() => go(1)}>
                    <span className="block">{[d.site, d.location].filter(Boolean).join(' · ')}</span>
                    <span className="mt-1 block whitespace-pre-line text-slate-muted">{d.description}</span>
                    {files.length > 0 && <span className="mt-1 block font-mono text-[0.78rem] text-slate-muted">{files.length} archivo(s) por adjuntar: {files.map((f) => f.name).join(', ')}</span>}
                  </Row>
                  <Row label="Contacto" onEdit={() => go(2)}>
                    <span className="block">{d.name} · {d.company}</span>
                    <span className="block text-slate-muted">{d.email} · {d.phone}</span>
                  </Row>
                </dl>
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
                    onClick={async () => { if (await copyText(message)) { setCopied(true); window.setTimeout(() => setCopied(false), 2000) } else { setCopied(false); document.getElementById(`${uid}-msg`)?.focus() } }}
                    className="inline-flex items-center gap-2 font-medium text-ink hover:text-tech"
                  >
                    {copied ? <Check aria-hidden className="h-4 w-4" /> : <Copy aria-hidden className="h-4 w-4" />}
                    {copied ? 'Copiado' : 'Copiar solicitud'}
                  </button>
                </div>
                <details className="mt-4 text-[0.85rem]">
                  <summary className="cursor-pointer text-slate-muted hover:text-ink">Ver el mensaje que se enviará</summary>
                  <textarea id={`${uid}-msg`} readOnly rows={10} value={message} className="field mt-2 font-mono text-[0.78rem]" onFocus={(e) => e.currentTarget.select()} aria-label="Mensaje de la solicitud" />
                </details>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* navegación */}
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-5">
          {step > 0 ? (
            <button type="button" onClick={() => go(step - 1)} className="inline-flex items-center gap-2 text-[0.92rem] text-slate-muted hover:text-ink">
              <ArrowLeft aria-hidden className="h-4 w-4" /> Atrás
            </button>
          ) : (
            <span className="font-mono text-[0.72rem] text-slate-faint">Paso 1 de 4</span>
          )}
          {step < 3 && (
            <button type="button" onClick={next} className="group inline-flex items-center gap-2.5 rounded-[2px] bg-corp px-6 py-3 text-[0.95rem] font-medium text-white transition-colors hover:bg-navy">
              {step === 2 ? 'Revisar solicitud' : 'Continuar'}
            </button>
          )}
        </div>
        <p className="sr-only" aria-live="polite">Paso {step + 1} de 4: {STEPS[step]}</p>
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

function Row({ label, children, onEdit }: { label: string; children: ReactNode; onEdit: () => void }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)_auto] gap-3 py-3.5 sm:grid-cols-[8rem_minmax(0,1fr)_auto]">
      <dt className="pt-0.5 text-small text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{children}</dd>
      <dd>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1 text-[0.82rem] text-slate-muted hover:text-tech" aria-label={`Editar ${label.toLowerCase()}`}>
          <Pencil aria-hidden className="h-3.5 w-3.5" /> Editar
        </button>
      </dd>
    </div>
  )
}
