import { expect, test, type Page } from '@playwright/test'
import { PROJECTS } from '../src/data/content'
import { SERVICES } from '../src/data/solutions'

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
