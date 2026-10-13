import { COMPANY } from '../../data/company'
import { IMG } from '../../data/media'
import { scrollToId } from '../../lib/utils'
import { Button } from '../ui'

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative mx-auto flex max-w-frame flex-col overflow-hidden bg-white lg:block">
      {/* Imagen a sangre a la derecha en escritorio */}
      <div className="relative order-2 aspect-[4/3] w-full sm:aspect-[16/9] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-1/2">
        <img src={IMG.aisle.src} alt={IMG.aisle.alt} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: '66% 50%' }} {...{ fetchpriority: 'high' }} />
        <p className="img-caption">Imagen de referencia</p>
      </div>

      <div className="container relative order-1">
        <div className="flex flex-col py-12 sm:py-16 lg:min-h-[min(760px,calc(100svh-124px))] lg:w-[46%] lg:justify-center lg:py-24">
          <h1 id="hero-title" className="text-display max-w-[11.5ch] !font-semibold">
            Conectamos la infraestructura que mueve tu empresa.
          </h1>
          <p className="mt-7 max-w-[30rem] text-lead text-body">
            Ingeniería, instalación y mantenimiento de redes, telecomunicaciones y seguridad electrónica para empresas e industria.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button onClick={() => scrollToId('soluciones')}>Conoce nuestras soluciones</Button>
            <Button to="/contacto" variant="secondary">Solicita una cotización</Button>
          </div>
          <dl className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6 text-small lg:mt-16">
            <div><dt className="text-muted">Experiencia</dt><dd className="font-medium text-ink">{COMPANY.years} años en proyectos</dd></div>
            <div><dt className="text-muted">Cumplimiento</dt><dd className="font-medium text-ink">Registro REPSE</dd></div>
            <div><dt className="text-muted">Base</dt><dd className="font-medium text-ink">Monterrey, N.L.</dd></div>
          </dl>
        </div>
      </div>
    </section>
  )
}
