import type { ReactNode } from 'react'
import { PageHero } from '../components/layout/PageHero'
import { COMPANY } from '../data/company'
import { useSeo } from '../lib/seo'
import { SEO } from '../data/seo'

// Aviso de privacidad integral. Conviene que lo revise un asesor legal.
// Por ahora el responsable se identifica con el nombre comercial; al escribir la razón social
// aquí, el texto pasa a decir "<razón social>, que opera comercialmente como Interfaz Redes…".
const RAZON_SOCIAL = ''
const ACTUALIZADO = 'Octubre de 2026'

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-10 first:border-t-0 first:pt-0">
      <h2 className="text-h3">{title}</h2>
      <div className="mt-4 max-w-prose space-y-4 text-body">{children}</div>
    </section>
  )
}

export default function Privacy() {
  useSeo(SEO.privacy)
  return (
    <>
      <PageHero crumbs={[{ label: 'Aviso de privacidad' }]} title="Aviso de privacidad" lede={`Última actualización: ${ACTUALIZADO}.`} />
      <section className="pb-28">
        <div className="container grid gap-12 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <p className="bg-mist p-5 text-small text-body">Para ejercer sus derechos o resolver dudas sobre este aviso, escriba a <a href={`mailto:${COMPANY.email}`} className="break-all font-medium text-ink link-line">{COMPANY.email}</a>.</p>
          </aside>
          <div className="lg:col-span-8 lg:col-start-5">
            <Block title="Responsable">
              <p>{RAZON_SOCIAL ? `${RAZON_SOCIAL}, que opera comercialmente como ${COMPANY.name}` : COMPANY.name}, con domicilio en {COMPANY.address}, es responsable del uso y protección de sus datos personales conforme a la legislación mexicana en materia de protección de datos personales en posesión de los particulares.</p>
            </Block>
            <Block title="Datos que recabamos">
              <p>A través del formulario de cotización y de los medios de contacto de este sitio podemos recabar: nombre, empresa, correo electrónico, número de teléfono o WhatsApp, ciudad o ubicación del proyecto, la descripción de su necesidad y los archivos que decida adjuntar (planos, fotografías o documentos).</p>
              <p>No solicitamos datos personales sensibles ni datos financieros a través de este sitio.</p>
            </Block>
            <Block title="Finalidades">
              <p><strong className="font-medium text-ink">Finalidades primarias</strong>, necesarias para atender su solicitud: contactarle, elaborar una propuesta o cotización, agendar levantamientos técnicos y dar seguimiento al proyecto.</p>
              <p><strong className="font-medium text-ink">Finalidades secundarias</strong>: enviarle información sobre servicios relacionados. Si no desea que sus datos se usen para esta finalidad, puede indicarlo escribiendo a {COMPANY.email}.</p>
            </Block>
            <Block title="Transferencias">
              <p>Sus datos no se venden ni se transfieren a terceros, salvo cuando sea necesario para cumplir obligaciones legales o requerimientos de autoridad competente.</p>
              <p>Cuando envía el formulario de cotización, sus datos y archivos viajan cifrados y se entregan al correo de nuestro equipo comercial mediante un proveedor de envío de correo electrónico; también podemos recibir un aviso interno por WhatsApp Business (Meta) con los datos de la solicitud. Estos proveedores procesan la información sólo para entregarla. El sitio no conserva copia de los archivos adjuntos. Cuando la recepción automática está activa, le enviamos un acuse de recibo con su folio al correo que indique.</p>
              <p>Si elige enviar su solicitud usted mismo por WhatsApp o por correo, el mensaje se transmite mediante esos servicios, sujetos a sus propias políticas de privacidad.</p>
            </Block>
            <Block title="Derechos ARCO">
              <p>Usted puede acceder, rectificar o cancelar sus datos personales, u oponerse a su uso (derechos ARCO), así como revocar su consentimiento, enviando una solicitud a <span className="select-all font-medium text-ink">{COMPANY.email}</span> que incluya su nombre, un medio para responderle, la descripción del derecho que desea ejercer y una identificación.</p>
              <p>Daremos respuesta dentro de los plazos que establece la ley.</p>
            </Block>
            <Block title="Uso de cookies y medición">
              <p>Este sitio puede utilizar herramientas de medición de tráfico, como Google Analytics, para conocer de forma agregada cómo se usan sus páginas. Estas herramientas no se utilizan para identificarle personalmente. Puede deshabilitar las cookies desde la configuración de su navegador.</p>
            </Block>
            <Block title="Cambios a este aviso">
              <p>Cualquier modificación a este aviso de privacidad se publicará en esta misma página, indicando la fecha de la última actualización.</p>
            </Block>
          </div>
        </div>
      </section>
    </>
  )
}
