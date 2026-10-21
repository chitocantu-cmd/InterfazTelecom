import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import { PROJECTS } from '../src/data/content'
import { SERVICES } from '../src/data/solutions'
import { fullTitle, SEO_ROUTES } from '../src/data/seo'

const PAGES = ['/', '/soluciones', '/industrias', '/proyectos', '/nosotros', '/contacto', '/aviso-de-privacidad']
const ROUTES = [...PAGES, ...SERVICES.map((s) => `/soluciones/${s.slug}`), ...PROJECTS.map((p) => `/proyectos/${p.slug}`)]

/** Registra errores de consola y de JavaScript durante la prueba. */
function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(e.message))
  return errors
}

/**
 * Elementos que se salen del ancho de la ventana sin estar recortados a propósito.
 * (El body oculta el desplazamiento horizontal, así que scrollWidth no basta para detectarlos.)
 */
function overflowing(page: Page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    const bad: string[] = []
    for (const el of document.querySelectorAll('body *')) {
      const rc = el.getBoundingClientRect()
      if (!rc.width || (rc.right <= vw + 1 && rc.left >= -1)) continue
      let clipped = false
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        if (getComputedStyle(a).overflowX === 'visible') continue
        const ar = a.getBoundingClientRect()
        if (ar.right <= vw + 1 && ar.left >= -1) { clipped = true; break }
      }
      if (!clipped) bad.push(`<${el.tagName.toLowerCase()}> "${(el.textContent ?? '').trim().slice(0, 40)}"`)
    }
    return bad.slice(0, 5)
  })
}

test.describe('rutas', () => {
  for (const route of ROUTES) {
    test(`carga ${route}`, async ({ page }) => {
      const errors = trackErrors(page)
      await page.goto(route)
      await expect(page.locator('h1').first()).toBeVisible()
      await expect(page.locator('main')).not.toBeEmpty()
      await page.waitForLoadState('networkidle')
      const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src))
      expect(broken, 'imágenes rotas').toEqual([])
      expect(await overflowing(page), 'elementos fuera de la pantalla').toEqual([])
      expect(errors, 'errores de consola').toEqual([])
    })
  }

  test('ruta inexistente muestra 404', async ({ page }) => {
    await page.goto('/no-existe')
    await expect(page.getByRole('heading', { name: 'Esta página no existe.' })).toBeVisible()
    await page.getByRole('main').getByRole('link', { name: 'Ir al inicio' }).click()
    await expect(page).toHaveURL('/')
  })

  test('servicio inexistente regresa al índice de soluciones', async ({ page }) => {
    await page.goto('/soluciones/no-existe')
    await expect(page).toHaveURL('/soluciones')
  })
})

test.describe('acomodo en otros anchos', () => {
  test.skip(({ isMobile }) => isMobile, 'se recorren los anchos desde el proyecto de escritorio')

  for (const width of [320, 768, 1024, 1280, 1920, 2560]) {
    test(`sin elementos fuera de la pantalla a ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      for (const route of PAGES) {
        await page.goto(route)
        await expect(page.locator('h1').first()).toBeVisible()
        expect(await overflowing(page), `${route} a ${width}px`).toEqual([])
      }
    })
  }

  test('el header completo cabe en laptops', async ({ page }) => {
    for (const width of [1024, 1180, 1280]) {
      await page.setViewportSize({ width, height: 800 })
      await page.goto('/')
      const cta = await page.locator('header').getByRole('link', { name: 'Cotizar proyecto' }).boundingBox()
      expect(cta!.x + cta!.width, `botón Cotizar a ${width}px`).toBeLessThanOrEqual(width)
    }
  })

  test('las imágenes a sangre no se estiran más allá de 1600px', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1200 })
    await page.goto('/soluciones')
    const box = await page.locator('main section').first().locator('img').boundingBox()
    expect(box!.width).toBeLessThanOrEqual(1600)
  })

  test('la ruta de navegación no repite nombres', async ({ page }) => {
    await page.goto('/soluciones/fibra-optica')
    await expect(page.getByRole('navigation', { name: 'Ruta de navegación' }).getByRole('listitem')).toHaveText(['Inicio', '/Soluciones', '/Fibra óptica'])
  })
})

test.describe('logotipo', () => {
  test('aparece en header y footer y lleva al inicio', async ({ page }) => {
    await page.goto('/nosotros')
    const headerLogo = page.locator('header').getByRole('img', { name: 'Interfaz Redes y Telecomunicaciones' })
    await expect(headerLogo).toBeVisible()
    await expect(page.locator('footer').getByRole('img', { name: 'Interfaz Redes y Telecomunicaciones' })).toBeVisible()
    await expect.poll(() => headerLogo.evaluate((i: HTMLImageElement) => i.naturalWidth), { message: 'el logotipo carga' }).toBeGreaterThan(0)
    await page.getByRole('link', { name: /ir al inicio/i }).click()
    await expect(page).toHaveURL('/')
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.ico')
  })
})

test.describe('header de escritorio', () => {
  test.skip(({ isMobile }) => isMobile, 'sólo escritorio')

  test('enlaces principales', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Principal' })
    for (const [name, path] of [['Industrias', '/industrias'], ['Proyectos', '/proyectos'], ['Nosotros', '/nosotros'], ['Contacto', '/contacto'], ['Inicio', '/']]) {
      await nav.getByRole('link', { name, exact: true }).click()
      await expect(page).toHaveURL(path)
      await expect(page.locator('h1').first()).toBeVisible()
    }
  })

  test('menú de soluciones', async ({ page }) => {
    await page.goto('/')
    const mega = page.locator('#mega-soluciones')
    const btn = page.getByRole('button', { name: 'Soluciones', exact: true })
    // Con mouse: el cursor lo abre y el clic que sigue lo deja abierto; un segundo clic lo cierra.
    await btn.click()
    await expect(mega).toBeVisible()
    await page.waitForTimeout(300)
    await expect(mega).toBeVisible()
    await btn.click()
    await expect(mega).toBeHidden()
    await btn.click()
    await expect(mega).toBeVisible()
    await mega.locator('a[href="/soluciones/fibra-optica"]').click()
    await expect(page).toHaveURL('/soluciones/fibra-optica')
    await expect(page.getByRole('heading', { level: 1, name: 'Fibra óptica' })).toBeVisible()
    await expect(mega).toBeHidden()
  })

  test('menú de soluciones con teclado', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Soluciones', exact: true }).focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#mega-soluciones')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('#mega-soluciones')).toBeHidden()
  })

  test('menú de soluciones en tablet táctil', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true })
    const page = await ctx.newPage()
    await page.goto('/')
    await page.getByRole('button', { name: 'Soluciones', exact: true }).tap()
    await expect(page.locator('#mega-soluciones')).toBeVisible()
    await page.waitForTimeout(300)
    await expect(page.locator('#mega-soluciones')).toBeVisible()
    await page.locator('#mega-soluciones a[href="/soluciones/cctv-videovigilancia"]').tap()
    await expect(page).toHaveURL('/soluciones/cctv-videovigilancia')
    await ctx.close()
  })

  test('botón Cotizar proyecto', async ({ page }) => {
    await page.goto('/nosotros')
    await page.locator('header').getByRole('link', { name: 'Cotizar proyecto' }).click()
    await expect(page).toHaveURL('/contacto')
  })
})

test.describe('menú móvil', () => {
  test.skip(({ isMobile }) => !isMobile, 'sólo móvil')

  test('abre, navega y cierra', async ({ page }) => {
    await page.goto('/')
    const menu = page.locator('#menu-movil')
    await page.getByRole('button', { name: 'Abrir menú' }).click()
    await expect(menu).toBeVisible()
    await page.getByRole('button', { name: 'Cerrar menú' }).click()
    await expect(menu).toBeHidden()

    await page.getByRole('button', { name: 'Abrir menú' }).click()
    await menu.getByRole('button', { name: 'Soluciones' }).click()
    await menu.getByRole('link', { name: 'Control de acceso' }).click()
    await expect(page).toHaveURL('/soluciones/control-de-acceso')
    await expect(menu).toBeHidden()

    await page.getByRole('button', { name: 'Abrir menú' }).click()
    await menu.getByRole('link', { name: 'Cotizar proyecto' }).click()
    await expect(page).toHaveURL('/contacto')
  })
})

test.describe('cotizador', () => {
  test('valida campos y genera el mensaje de WhatsApp', async ({ page }) => {
    await page.goto('/contacto')
    const form = page.locator('main')
    const next = form.getByRole('button', { name: 'Continuar' })

    await next.click()
    await expect(form.getByRole('alert')).toHaveText('Seleccione al menos una opción.')
    await form.getByText('Cableado y redes', { exact: true }).click()
    await form.getByText('CCTV', { exact: true }).click()
    await next.click()

    await next.click()
    await expect(form.getByRole('alert')).toHaveCount(2)
    await form.getByRole('button', { name: 'Planta industrial' }).click()
    await form.getByRole('textbox', { name: 'Ciudad o ubicación general' }).fill('Apodaca, N.L.')
    await form.getByRole('textbox', { name: 'Describa la necesidad' }).fill('Nave nueva con 40 nodos y 8 cámaras en andenes.')
    await next.click()

    const review = form.getByRole('button', { name: 'Revisar solicitud' })
    await form.getByRole('textbox', { name: 'Nombre' }).fill('Ana López')
    await form.getByRole('textbox', { name: 'Empresa' }).fill('Empresa de Prueba')
    await form.getByRole('textbox', { name: 'Correo corporativo' }).fill('ana@')
    await form.getByRole('textbox', { name: 'WhatsApp' }).fill('81 12')
    await review.click()
    await expect(form.getByRole('alert')).toHaveCount(2)
    await form.getByRole('textbox', { name: 'Correo corporativo' }).fill('ana@empresa.mx')
    await form.getByRole('textbox', { name: 'WhatsApp' }).fill('81 1234 5678')
    await review.click()

    await expect(form.getByRole('heading', { name: 'Revise su solicitud' })).toBeVisible()
    const wa = new URL((await form.getByRole('link', { name: 'Enviar por WhatsApp' }).getAttribute('href'))!)
    expect(wa.origin + wa.pathname).toBe('https://wa.me/528180871700')
    const text = wa.searchParams.get('text')!
    for (const part of ['Cableado y redes, CCTV', 'Planta industrial', 'Apodaca, N.L.', '40 nodos', 'Ana López', 'Empresa de Prueba', 'ana@empresa.mx', '81 1234 5678']) {
      expect(text).toContain(part)
    }
    const mail = (await form.getByRole('link', { name: 'Enviar por correo' }).getAttribute('href'))!
    expect(mail.startsWith('mailto:ffacundo@interfaz.com.mx?subject=')).toBe(true)

    // Editar conserva lo capturado
    await form.getByRole('button', { name: 'Editar proyecto' }).click()
    await expect(form.getByRole('textbox', { name: 'Ciudad o ubicación general' })).toHaveValue('Apodaca, N.L.')
  })

  test('la página de servicio preselecciona la necesidad', async ({ page }) => {
    await page.goto('/soluciones/cctv-videovigilancia')
    await page.getByRole('button', { name: 'Cotizar este servicio' }).click()
    const quote = page.locator('#cotizar')
    await expect(quote.getByText('Desde: CCTV y videovigilancia')).toBeVisible()
    await expect(quote.locator('input[type=checkbox]:checked')).toHaveCount(1)
  })

  test('acepta parámetros desde otras páginas', async ({ page }) => {
    await page.goto('/contacto?tipo=fibra&necesidad=edificios')
    await expect(page.locator('main input[type=checkbox]:checked')).toHaveCount(1)
    await expect(page.getByText('Desde: Conectar edificios o naves')).toBeVisible()
  })
})

test.describe('pestañas y filtros', () => {
  test('industrias cambian de pestaña', async ({ page }) => {
    await page.goto('/industrias')
    await page.getByRole('tab', { name: 'Centros de distribución' }).click()
    await expect(page.getByRole('tab', { name: 'Centros de distribución' })).toHaveAttribute('aria-selected', 'true')
    await expect(page).toHaveURL('/industrias?sector=cedis')
    await expect(page.getByRole('tabpanel').getByRole('heading', { level: 2 })).toHaveText('Centros de distribución')
  })

  test('industrias: el enlace con ?sector= abre ese sector y los cinco están en el HTML', async ({ page }) => {
    await page.goto('/industrias?sector=educacion')
    await expect(page.getByRole('tab', { name: 'Instituciones educativas' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('tabpanel').getByRole('heading', { level: 2 })).toHaveText('Instituciones educativas')
    // Los otros cuatro van ocultos (para buscadores), fuera del árbol de accesibilidad.
    await expect(page.locator('[role=tabpanel]')).toHaveCount(5)
    await expect(page.locator('[role=tabpanel][hidden]')).toHaveCount(4)
  })

  test('proyectos se filtran por categoría y sector', async ({ page }) => {
    await page.goto('/proyectos')
    const list = page.locator('#lista-proyectos')
    await page.getByRole('button', { name: 'CCTV', exact: true }).click()
    await expect(list.locator('h2')).toHaveText(['Videovigilancia en centro de distribución'])
    await page.locator('#f-sector').selectOption('Corporativo')
    await expect(list.getByText('No hay casos con esa combinación de filtros.')).toBeVisible()
    await list.getByRole('button', { name: 'Quitar filtros' }).click()
    await expect(list.locator('h2')).toHaveCount(PROJECTS.length)
  })

  test('explorador de necesidades del inicio', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Conectar edificios o naves').click()
    await expect(page.getByRole('link', { name: 'Cotizar con esta necesidad' })).toHaveAttribute('href', '/contacto?tipo=fibra&necesidad=edificios')
  })
})

test.describe('WhatsApp flotante', () => {
  test('aparece en las páginas y se oculta junto al cotizador', async ({ page }) => {
    await page.goto('/')
    const wa = page.getByRole('link', { name: 'Hablar por WhatsApp con un especialista' })
    await expect(wa).toBeVisible()
    await expect(wa).toHaveAttribute('href', /^https:\/\/wa\.me\/528180871700\?text=/)
    await page.goto('/soluciones/fibra-optica')
    await expect(wa).toBeVisible()
    await page.locator('[aria-label="Progreso de la solicitud"]').scrollIntoViewIfNeeded()
    // Oculto también para el teclado y el lector de pantalla (visibility), no sólo transparente.
    const fab = page.locator('a[aria-label="Hablar por WhatsApp con un especialista"]')
    await expect(fab).toHaveCSS('opacity', '0')
    await expect(fab).toHaveCSS('visibility', 'hidden')
    await expect(wa).toHaveCount(0)
    await page.goto('/contacto')
    await expect(wa).toHaveCount(0)
  })
})

// El HTML de cada ruta lo escribe scripts/prerender.mjs en el build; en el servidor de desarrollo no existe.
test.describe('HTML de cada página (sitio publicado)', () => {
  test.skip(!process.env.BASE_URL, 'sólo contra el build publicado (BASE_URL)')
  test('título, descripción e imagen para compartir sin JavaScript', async ({ request }) => {
    for (const [path, { title, description }] of SEO_ROUTES) {
      const html = await (await request.get(path)).text()
      const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
      expect(html, path).toContain(`<title>${esc(fullTitle(title))}</title>`)
      expect(html, path).toContain(`<meta name="description" content="${esc(description)}"`)
      const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1]
      expect(og, `${path} og:image`).toMatch(/^https:\/\//)
      if (path === '/') expect((await request.get(og!)).status(), 'og:image responde').toBe(200)
      expect(html, `${path} og:image:alt`).toContain('<meta property="og:image:alt"')
      // Datos estructurados: empresa y sitio en todas; servicio y ruta de navegación donde aplica.
      const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1])
      const types = ld['@graph'].map((n: { '@type': string }) => n['@type'])
      expect(types, path).toEqual(expect.arrayContaining(['LocalBusiness', 'WebSite']))
      if (path.startsWith('/soluciones/')) expect(types, path).toContain('Service')
      if (path !== '/') expect(types, path).toContain('BreadcrumbList')
    }
  })

  test('sitemap, robots, íconos y redirección del slug anterior', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap.match(/<loc>/g)).toHaveLength(SEO_ROUTES.length)
    expect(sitemap).toContain('/soluciones/redes-empresariales</loc>')
    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toContain('Disallow: /api/')
    expect(robots).toMatch(/Sitemap: https:\/\/\S+\/sitemap\.xml/)
    for (const icon of ['/favicon.ico', '/apple-touch-icon.png']) {
      const res = await request.get(icon)
      expect(res.status(), icon).toBe(200)
      expect(res.headers()['cache-control'], icon).toContain('max-age=86400')
    }
    const old = await request.get('/soluciones/switching-routing', { maxRedirects: 0 })
    expect(old.status()).toBe(308)
    expect(old.headers().location).toMatch(/\/soluciones\/redes-empresariales$/)
  })
})

// Recepción automática de cotizaciones. Los envíos sólo se prueban en local (modo de prueba): contra el
// sitio publicado llegarían de verdad al equipo de ventas.
test.describe('recepción de cotizaciones', () => {
  async function fillQuote(page: Page) {
    await page.goto('/contacto')
    const form = page.locator('main')
    await form.getByText('Fibra óptica', { exact: true }).click()
    await form.getByRole('button', { name: 'Continuar' }).click()
    await form.getByRole('button', { name: 'Planta industrial' }).click()
    await form.getByRole('textbox', { name: 'Ciudad o ubicación general' }).fill('Apodaca, N.L.')
    await form.getByRole('textbox', { name: 'Describa la necesidad' }).fill('Enlace de fibra entre dos naves a 180 m.\nIncluye 8 cámaras en andenes.')
    await form.locator('input[type=file]').setInputFiles({ name: 'plano nave.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%prueba\n') })
    await expect(form.getByText('plano nave.pdf')).toBeVisible()
    await form.getByRole('button', { name: 'Continuar' }).click()
    await form.getByRole('textbox', { name: 'Nombre' }).fill('Ana López Muñoz')
    await form.getByRole('textbox', { name: 'Empresa' }).fill('Empresa de Prueba')
    await form.getByRole('textbox', { name: 'Correo corporativo' }).fill('ana@empresa.mx')
    await form.getByRole('textbox', { name: 'WhatsApp' }).fill('81 1234 5678')
    await form.getByRole('button', { name: 'Revisar solicitud' }).click()
    return form
  }

  test('envía la solicitud, muestra el folio y no duplica', async ({ page }) => {
    test.skip(!!process.env.BASE_URL, 'sólo en local: en el sitio publicado se enviaría a ventas')
    const form = await fillQuote(page)
    await page.waitForTimeout(3000) // el servidor descarta como bot lo que se captura en menos de 3 s
    await form.getByRole('button', { name: 'Enviar solicitud' }).click()
    await expect(form.getByRole('heading', { name: 'Solicitud recibida' })).toBeVisible()
    const folio = (await form.getByText(/^Folio COT-/).textContent())!.replace('Folio ', '').trim()
    expect(folio).toMatch(/^COT-\d{6}-[2-9A-Z]{6}$/)
    await expect(form.getByText('Enviamos un acuse de recibo a ana@empresa.mx.')).toBeVisible()

    const ventas = readFileSync(`.cotizaciones-prueba/${folio}-ventas.txt`, 'utf8')
    for (const part of ['Para: ffacundo@interfaz.com.mx, ventas@interfaz.com.mx', 'Responder a: ana@empresa.mx', 'Asunto: Nueva solicitud de cotización | Interfaz Redes | Fibra óptica', 'Adjuntos: plano nave.pdf', 'Nombre: Ana López Muñoz', 'Ubicación: Planta industrial · Apodaca, N.L.', 'Incluye 8 cámaras en andenes.']) {
      expect(ventas).toContain(part)
    }
    expect(readFileSync(`.cotizaciones-prueba/${folio}-ventas.html`, 'utf8')).toContain('NUEVA SOLICITUD DE COTIZACIÓN')
    expect(readFileSync(`.cotizaciones-prueba/${folio}-acuse.txt`, 'utf8')).toContain(`Folio: ${folio}`)
    expect(ventas).toContain('los envió una persona externa')
    // El acuse no repite texto libre del formulario (no sirve para mandar mensajes a terceros).
    const acuse = readFileSync(`.cotizaciones-prueba/${folio}-acuse.txt`, 'utf8')
    expect(acuse).toContain('Hola, Ana:')
    expect(acuse).toContain('Tipo de inmueble: Planta industrial')
    expect(acuse).not.toContain('Apodaca')
    const aviso = readFileSync(`.cotizaciones-prueba/${folio}-whatsapp.txt`, 'utf8')
    expect(aviso).toContain('*NUEVA COTIZACIÓN — INTERFAZ REDES*')
    expect(aviso).toContain(`Folio: ${folio}`)
    expect(aviso).toContain('{{9}} Enlace de fibra entre dos naves a 180 m. · Incluye 8 cámaras en andenes.')
  })

  test('el servidor valida y rechaza envíos no permitidos', async ({ request, baseURL }) => {
    test.skip(!!process.env.BASE_URL, 'sólo en local')
    const ok = { types: 'fibra', location: 'Apodaca', description: 'Enlace de fibra entre dos naves.', name: 'Ana López', company: 'Empresa', email: 'ana@empresa.mx', phone: '8112345678', elapsed: '9000' }
    const post = (multipart: Record<string, string | { name: string; mimeType: string; buffer: Buffer }>, origin: string | null = baseURL!) =>
      request.post('/api/cotizacion', { multipart, headers: origin ? { Origin: origin } : {} })

    expect((await post(ok, null)).status(), 'sin origen').toBe(403)
    expect((await post(ok, 'https://otro-sitio.com')).status(), 'otro origen').toBe(403)
    const invalid = await post({ ...ok, email: 'ana@', phone: '81' })
    expect(invalid.status()).toBe(400)
    expect(Object.keys((await invalid.json()).errores)).toEqual(['email', 'phone'])
    expect((await (await post({ ...ok, hp_ref: 'https://spam.example' })).json()).codigo, 'campo trampa').toBe('rechazada')
    expect((await (await post({ ...ok, elapsed: '500' })).json()).codigo, 'demasiado rápido').toBe('rechazada')
    const fake = await post({ ...ok, files: { name: 'plano.pdf', mimeType: 'application/pdf', buffer: Buffer.from('no es un pdf') } })
    expect((await fake.json()).codigo, 'archivo falso').toBe('archivos')
  })

  test('sin recepción automática el cotizador sigue con WhatsApp y correo', async ({ page }) => {
    await page.route('**/api/cotizacion', (r) => r.fulfill({ json: { recepcion: false } }))
    const form = await fillQuote(page)
    await expect(form.getByRole('button', { name: 'Enviar solicitud' })).toHaveCount(0)
    await expect(form.getByRole('link', { name: 'Enviar por WhatsApp' })).toBeVisible()
    await expect(form.getByRole('button', { name: 'Copiar solicitud' })).toBeVisible()
  })

  test('si el servidor falla no muestra éxito', async ({ page }) => {
    await page.route('**/api/cotizacion', (r) =>
      r.request().method() === 'GET'
        ? r.fulfill({ json: { recepcion: true, whatsapp: false } })
        : r.fulfill({ status: 502, json: { ok: false, codigo: 'entrega', mensaje: 'No pudimos entregar su solicitud al equipo comercial.' } }),
    )
    const form = await fillQuote(page)
    await form.getByRole('button', { name: 'Enviar solicitud' }).click()
    await expect(form.getByRole('alert')).toContainText('No se pudo enviar la solicitud.')
    await expect(form.getByRole('heading', { name: 'Solicitud recibida' })).toHaveCount(0)
    await expect(form.getByRole('button', { name: 'Intentar de nuevo' })).toBeVisible()
    await expect(form.getByRole('link', { name: 'Enviar por WhatsApp' })).toBeVisible()
  })
})

// Correcciones P1 de la auditoría (.claude/audits/FIXES.md).
test.describe('correcciones P1', () => {
  test('una sección que no carga muestra un aviso en lugar de la pantalla en blanco', async ({ page }) => {
    // En desarrollo la página es /src/pages/Contact.tsx; publicada, /assets/Contact-<hash>.js.
    await page.route(/\/(src\/pages\/Contact\.tsx|assets\/Contact-[^/]+\.js)/, (r) => r.abort())
    await page.goto('/contacto')
    await expect(page.getByRole('heading', { name: 'No se pudo cargar esta sección.' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Recargar' })).toBeVisible()
  })

  test('una ruta inexistente responde 404 y no se indexa', async ({ page }) => {
    const res = await page.goto('/no-existe-p1')
    if (process.env.BASE_URL) expect(res!.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'Esta página no existe.' })).toBeVisible()
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
    await page.getByRole('main').getByRole('link', { name: 'Ir al inicio' }).click()
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
  })

  test('las siglas se conservan a mitad de frase', async ({ page }) => {
    await page.goto('/soluciones/cctv-videovigilancia')
    await expect(page.getByText('La solicitud ya incluye CCTV y videovigilancia.')).toBeVisible()
    await page.goto('/soluciones/telefonia-ip')
    await expect(page.getByText('La solicitud ya incluye voz y telefonía IP.')).toBeVisible()
  })

  test('mega menú: el teclado entra al panel y sale en orden', async ({ page, isMobile }) => {
    test.skip(isMobile, 'sólo escritorio')
    await page.goto('/')
    const btn = page.getByRole('button', { name: 'Soluciones', exact: true })
    const panel = page.locator('#mega-soluciones')
    await btn.focus()
    await page.keyboard.press('Enter')
    await expect(panel).toBeVisible()
    await expect(panel.getByRole('link').first()).toBeFocused()
    await page.keyboard.press('Shift+Tab')
    await expect(btn).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(panel.getByRole('link').first()).toBeFocused()
    await panel.getByRole('link').last().focus()
    await page.keyboard.press('Tab')
    await expect(panel).toBeHidden()
    await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Industrias' })).toBeFocused()
  })

  test('menú móvil: Escape devuelve el foco y libera la página', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'sólo móvil')
    await page.goto('/')
    await page.getByRole('button', { name: 'Abrir menú' }).click()
    expect(await page.locator('#contenido').evaluate((el) => el.hasAttribute('inert'))).toBe(true)
    await page.keyboard.press('Escape')
    await expect(page.locator('#menu-movil')).toBeHidden()
    await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeFocused()
    expect(await page.locator('#contenido').evaluate((el) => el.hasAttribute('inert'))).toBe(false)
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
  })

  test('al navegar, el foco pasa al contenido de la página nueva', async ({ page, isMobile }) => {
    test.skip(isMobile, 'sólo escritorio')
    await page.goto('/')
    await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Nosotros' }).click()
    await expect(page).toHaveURL('/nosotros')
    await expect(page.locator('#contenido')).toBeFocused()
  })
})

// Correcciones P2 de la auditoría: antes de activar la recepción automática.
test.describe('correcciones P2 (recepción)', () => {
  const ok = { types: 'fibra', location: 'Apodaca', description: 'Enlace de fibra entre dos naves.', name: 'Ana López', company: 'Empresa', email: 'ana@empresa.mx', phone: '8112345678', elapsed: '9000' }

  test('el servidor normaliza saltos de línea y valida estricto', async ({ request, baseURL }) => {
    test.skip(!!process.env.BASE_URL, 'sólo en local')
    const post = (multipart: Record<string, string>) => request.post('/api/cotizacion', { multipart, headers: { Origin: baseURL! } })
    // 3 990 caracteres con 60 saltos CRLF: en el navegador miden 3 990 y caben en el máximo de 4 000.
    const line = 'x'.repeat(65)
    const description = Array.from({ length: 60 }, () => line).join('\r\n').padEnd(3990 + 60, 'y')
    const res = await post({ ...ok, description: description.slice(0, 3990 + 60), key: `${Date.now()}-p2-saltos-de-linea` })
    expect(res.status(), await res.text()).toBe(200)

    for (const email of ['juan@acme..com', 'juan@acme.com.', '<a@b.co>', 'x@evil.mx?cc=otro@b.co']) {
      const r = await post({ ...ok, email })
      expect(r.status(), email).toBe(400)
      expect(Object.keys((await r.json()).errores), email).toEqual(['email'])
    }
    expect(Object.keys((await (await post({ ...ok, phone: 'abc 81 1234 5678' })).json()).errores)).toEqual(['phone'])
    const long = await post({ ...ok, name: 'A'.repeat(500) })
    expect(long.status()).toBe(413)
    expect((await long.json()).errores.name).toContain('120')
    const notForm = await request.post('/api/cotizacion', { data: ok, headers: { Origin: baseURL! } })
    expect((await notForm.json()).codigo).toBe('formato')
  })

  async function toReview(page: Page) {
    await page.goto('/contacto')
    const form = page.locator('main')
    await form.getByText('Fibra óptica', { exact: true }).click()
    await form.getByRole('button', { name: 'Continuar' }).click()
    await form.getByRole('textbox', { name: 'Ciudad o ubicación general' }).fill('Apodaca, N.L.')
    await form.getByRole('textbox', { name: 'Describa la necesidad' }).fill('Enlace de fibra entre dos naves a 180 m.')
    await form.getByRole('button', { name: 'Continuar' }).click()
    await form.getByRole('textbox', { name: 'Nombre' }).fill('Ana López')
    await form.getByRole('textbox', { name: 'Empresa' }).fill('Empresa de Prueba')
    await form.getByRole('textbox', { name: 'Correo corporativo' }).fill('ana@empresa.mx')
    await form.getByRole('textbox', { name: 'WhatsApp' }).fill('81 1234 5678')
    await form.getByRole('button', { name: 'Revisar solicitud' }).click()
    return form
  }
  const mockPost = (page: Page, reply: (route: import('@playwright/test').Route) => Promise<void>) =>
    page.route('**/api/cotizacion', (r) => (r.request().method() === 'GET' ? r.fulfill({ json: { recepcion: true, whatsapp: true } }) : reply(r)))

  test('si sólo llegó el WhatsApp, la confirmación lo dice y ofrece mandar los archivos', async ({ page }) => {
    await mockPost(page, (r) => r.fulfill({ json: { ok: true, folio: 'COT-261017-ABCDEF', fecha: '17 de octubre de 2026', estados: { correo: 'error', whatsapp: 'enviado', acuse: 'omitido' } } }))
    const form = await toReview(page)
    await form.getByRole('button', { name: 'Enviar solicitud' }).click()
    await expect(form.getByRole('heading', { name: 'Solicitud recibida' })).toBeFocused()
    await expect(form.getByText('Su solicitud llegó al equipo por WhatsApp, pero sin archivos')).toBeVisible()
    await expect(form.getByRole('link', { name: 'Enviar por correo' })).toHaveAttribute('href', /Folio%20COT-261017-ABCDEF/)
    await expect(form.getByText('Enviamos un acuse')).toHaveCount(0)
  })

  test('los errores del servidor vuelven al campo que hay que corregir', async ({ page }) => {
    await mockPost(page, (r) => r.fulfill({ status: 400, json: { ok: false, codigo: 'invalida', mensaje: 'Revise los datos de la solicitud.', errores: { email: 'Revise el formato del correo, por ejemplo nombre@empresa.com.' } } }))
    const form = await toReview(page)
    await form.getByRole('button', { name: 'Enviar solicitud' }).click()
    await expect(form.getByRole('heading', { name: '¿Con quién hablamos?' })).toBeVisible()
    await expect(form.getByRole('alert')).toHaveText('Revise el formato del correo, por ejemplo nombre@empresa.com.')
    await expect(form.getByRole('textbox', { name: 'Correo corporativo' })).toBeFocused()
    // Al corregir el dato, el error del servidor desaparece.
    await form.getByRole('textbox', { name: 'Correo corporativo' }).fill('ana@empresa.com.mx')
    await expect(form.getByRole('alert')).toHaveCount(0)
  })

  test('«Editar» y el envío manual se bloquean mientras se envía', async ({ page }) => {
    await mockPost(page, async (r) => {
      await new Promise((ok) => setTimeout(ok, 1500))
      await r.fulfill({ json: { ok: true, folio: 'COT-261017-ZZZZZZ', fecha: 'hoy', estados: { correo: 'enviado', whatsapp: 'enviado', acuse: 'enviado' } } })
    })
    const form = await toReview(page)
    await form.getByRole('button', { name: 'Enviar solicitud' }).click()
    await expect(form.getByRole('button', { name: 'Editar contacto' })).toBeDisabled()
    await expect(form.getByRole('link', { name: 'Enviar por WhatsApp' })).toHaveAttribute('aria-disabled', 'true')
    await expect(form.getByRole('heading', { name: 'Solicitud recibida' })).toBeVisible()
    await expect(form.getByText('Enviamos un acuse de recibo a ana@empresa.mx.')).toBeVisible()
  })
})

// Correcciones P3 de la auditoría: SEO sin cambios visuales.
test.describe('correcciones P3 (SEO)', () => {
  test('las categorías enlazan con #ancla y los enlaces anteriores (?s=) siguen funcionando', async ({ page }) => {
    await page.goto('/')
    await page.locator('footer').getByRole('link', { name: 'Fibra óptica', exact: true }).first().click()
    await expect(page).toHaveURL('/soluciones#fibra')
    await expect(page.locator('#fibra')).toBeInViewport()
    await expect(page.locator('#fibra')).toBeFocused()
    await page.goto('/soluciones?s=seguridad')
    await expect(page.locator('#seguridad')).toBeInViewport()
  })

  test('el menú móvil marca la página actual', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'sólo móvil')
    await page.goto('/nosotros')
    await page.getByRole('button', { name: 'Abrir menú' }).click()
    const menu = page.getByRole('navigation', { name: 'Menú móvil' })
    await expect(menu.getByRole('link', { name: 'Nosotros' })).toHaveAttribute('aria-current', 'page')
    await expect(menu.getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current', 'page')
  })

  test('el botón «Soluciones» anuncia que es la sección actual', async ({ page, isMobile }) => {
    test.skip(isMobile, 'sólo escritorio')
    await page.goto('/soluciones/fibra-optica')
    await expect(page.getByRole('navigation', { name: 'Principal' }).getByRole('button', { name: 'Soluciones (sección actual)' })).toBeVisible()
  })
})
