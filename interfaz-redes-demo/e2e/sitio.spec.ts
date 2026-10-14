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
    const headerLogo = page.locator('header').getByRole('img', { name: 'Interfaz Telecomunicaciones' })
    await expect(headerLogo).toBeVisible()
    await expect(page.locator('footer').getByRole('img', { name: 'Interfaz Telecomunicaciones' })).toBeVisible()
    await expect.poll(() => headerLogo.evaluate((i: HTMLImageElement) => i.naturalWidth), { message: 'el logotipo carga' }).toBeGreaterThan(0)
    await page.getByRole('link', { name: /ir al inicio/i }).click()
    await expect(page).toHaveURL('/')
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.jpg')
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
    expect(wa.origin + wa.pathname).toBe('https://wa.me/528134021700')
    const text = wa.searchParams.get('text')!
    for (const part of ['Cableado y redes, CCTV', 'Planta industrial', 'Apodaca, N.L.', '40 nodos', 'Ana López', 'Empresa de Prueba', 'ana@empresa.mx', '81 1234 5678']) {
      expect(text).toContain(part)
    }
    const mail = (await form.getByRole('link', { name: 'Enviar por correo' }).getAttribute('href'))!
    expect(mail.startsWith('mailto:ventas@interfaz.com.mx?subject=')).toBe(true)

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
    await expect(page.locator('#ind-panel h2')).toHaveText('Centros de distribución')
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
    await expect(wa).toHaveAttribute('href', /^https:\/\/wa\.me\/528134021700\?text=/)
    await page.goto('/soluciones/fibra-optica')
    await expect(wa).toBeVisible()
    await page.locator('[aria-label="Progreso de la solicitud"]').scrollIntoViewIfNeeded()
    await expect(wa).toHaveCSS('opacity', '0')
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
    }
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
    for (const part of ['Para: ventas@interfaz.com.mx', 'Responder a: ana@empresa.mx', 'Asunto: Nueva solicitud de cotización | Interfaz Redes | Fibra óptica', 'Adjuntos: plano nave.pdf', 'Nombre: Ana López Muñoz', 'Ubicación: Planta industrial · Apodaca, N.L.', 'Incluye 8 cámaras en andenes.']) {
      expect(ventas).toContain(part)
    }
    expect(readFileSync(`.cotizaciones-prueba/${folio}-ventas.html`, 'utf8')).toContain('NUEVA SOLICITUD DE COTIZACIÓN')
    expect(readFileSync(`.cotizaciones-prueba/${folio}-acuse.txt`, 'utf8')).toContain(`Folio: ${folio}`)
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
    expect((await (await post({ ...ok, website: 'https://spam.example' })).json()).codigo, 'campo trampa').toBe('rechazada')
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
