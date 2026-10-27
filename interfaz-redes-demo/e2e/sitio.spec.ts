import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import { fullTitle, pagesFor } from '../src/data/seo'
import { PROJECTS } from '../src/data/content'
import { municipioDe } from '../src/data/municipios'
import { buildContent } from '../src/i18n/content'
import es from '../src/i18n/messages/es'

// En local (servidor de desarrollo) se ven los borradores del centro técnico; publicado, no.
const ES_PAGES = pagesFor('es', es, buildContent(), { drafts: !process.env.BASE_URL })
const ROUTES = [...ES_PAGES.map((p) => p.path), '/en', '/ko', '/zh-CN', '/en/soluciones/fibra-optica', '/ko/industrias/cedis', '/zh-CN/explorador']
const MAIN = ['/', '/soluciones', '/industrias', '/industrias/cedis', '/proyectos', '/explorador', '/recursos', '/nosotros', '/contacto', '/aviso-de-privacidad', '/en', '/ko/soluciones/control-de-acceso', '/zh-CN/contacto']

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

/** El botón flotante de WhatsApp (sólo escritorio). */
const fab = (page: Page) => page.locator('a.fixed[href^="https://wa.me/"]')

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
      test.slow() // 13 cargas de página: con todas las pruebas en paralelo, el servidor de desarrollo tarda más
      await page.setViewportSize({ width, height: 900 })
      for (const route of MAIN) {
        await page.goto(route)
        await expect(page.locator('h1').first()).toBeVisible()
        expect(await overflowing(page), `${route} a ${width}px`).toEqual([])
      }
    })
  }

  test('el header completo cabe en laptops', async ({ page }) => {
    test.slow() // 20 cargas de página: con todas las pruebas en paralelo, el servidor de desarrollo tarda más
    for (const width of [1024, 1180, 1280, 1366, 1440]) {
      await page.setViewportSize({ width, height: 800 })
      for (const route of ['/', '/en', '/ko', '/zh-CN']) {
        await page.goto(route)
        const right = await page.locator('header .container').evaluate((c) => Math.max(...[...c.querySelectorAll('*')].map((e) => e.getBoundingClientRect().right)))
        expect(right, `header a ${width}px en ${route}`).toBeLessThanOrEqual(width)
      }
    }
  })

  test('las imágenes a sangre no se estiran más allá de 1600px', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1200 })
    await page.goto('/soluciones')
    // Ancho de la caja (sin la escala de la animación de entrada).
    const width = await page.locator('main section').first().locator('img').evaluate((i: HTMLImageElement) => i.offsetWidth)
    expect(width).toBeLessThanOrEqual(1600)
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

  test('el header se compacta al desplazarse sin mover el contenido', async ({ page }) => {
    await page.goto('/nosotros')
    const header = page.locator('header')
    const tall = (await header.boundingBox())!.height
    const h1Top = await page.locator('h1').evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
    await page.mouse.wheel(0, 600)
    await expect.poll(async () => (await header.boundingBox())!.height).toBeLessThan(tall)
    const after = await page.locator('h1').evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
    expect(Math.abs(after - h1Top), 'el contenido no se mueve (salvo redondeo de subpíxeles)').toBeLessThan(2)
  })
})

test.describe('header de escritorio', () => {
  test.skip(({ isMobile }) => isMobile, 'sólo escritorio')

  test('enlaces principales', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Principal' })
    for (const [name, path] of [['Industrias', '/industrias'], ['Proyectos', '/proyectos'], ['Explorador', '/explorador'], ['Nosotros', '/nosotros'], ['Contacto', '/contacto']]) {
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
    // La vista previa cambia con el frente técnico que se apunta.
    await mega.getByRole('link', { name: 'Seguridad electrónica', exact: true }).hover()
    await expect(mega.locator('aside')).toContainText('Seguridad electrónica')
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

  test('el header móvil lleva a cotizar sin abrir el menú', async ({ page }) => {
    await page.goto('/nosotros')
    await page.locator('header').getByRole('link', { name: 'Cotizar', exact: true }).click()
    await expect(page).toHaveURL('/contacto')
  })

  test('el selector de idioma está en el menú', async ({ page }) => {
    await page.goto('/soluciones/fibra-optica')
    await page.getByRole('button', { name: 'Abrir menú' }).click()
    await page.locator('#menu-movil').getByRole('link', { name: 'English' }).click()
    await expect(page).toHaveURL('/en/soluciones/fibra-optica')
    await expect(page.getByRole('heading', { level: 1, name: 'Fiber optics' })).toBeVisible()
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
    await form.getByRole('textbox', { name: /^Cargo/ }).fill('Gerente de mantenimiento')
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
    for (const part of ['Cableado y redes, CCTV', 'Planta industrial', 'Apodaca, N.L.', '40 nodos', 'Ana López', '*Cargo:* Gerente de mantenimiento', 'Empresa de Prueba', 'ana@empresa.mx', '81 1234 5678']) {
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

  test('un borrador sobrevive a la recarga de la pestaña', async ({ page }) => {
    await page.goto('/contacto')
    const form = page.locator('main')
    await form.getByText('Fibra óptica', { exact: true }).click()
    await form.getByRole('button', { name: 'Continuar' }).click()
    await form.getByRole('textbox', { name: 'Ciudad o ubicación general' }).fill('Santa Catarina, N.L.')
    await page.waitForTimeout(700) // el borrador se guarda 400 ms después de escribir
    await page.reload()
    await expect(form.getByText('Recuperamos la solicitud que dejó a medias en esta pestaña.')).toBeVisible()
    await expect(form.getByRole('textbox', { name: 'Ciudad o ubicación general' })).toHaveValue('Santa Catarina, N.L.')
    await form.getByRole('button', { name: 'Empezar de cero' }).click()
    await expect(form.getByText('¿Qué necesita implementar?')).toBeVisible()
    await expect(form.locator('input[type=checkbox]:checked')).toHaveCount(0)
  })
})

test.describe('industrias', () => {
  test('el índice lleva a cada sector y los enlaces anteriores (?sector=) siguen funcionando', async ({ page }) => {
    await page.goto('/industrias')
    await page.getByRole('link', { name: /Centros de distribución y logística/ }).first().click()
    await expect(page).toHaveURL('/industrias/cedis')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Centros de distribución y logística')
    await page.goto('/industrias?sector=educacion')
    await expect(page).toHaveURL('/industrias/educacion')
  })

  test('la página del sector explica y cotiza con el sector preseleccionado', async ({ page }) => {
    await page.goto('/industrias/industria')
    await expect(page.getByRole('heading', { name: 'Consideraciones técnicas' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Distancia y backbone' })).toBeVisible()
    const form = page.locator('#asesoria')
    await expect(form.getByText('Desde: Industria y manufactura')).toBeVisible()
    await form.getByText('Fibra óptica', { exact: true }).click()
    await form.getByRole('button', { name: 'Continuar' }).click()
    await expect(form.getByRole('button', { name: 'Planta industrial' })).toHaveAttribute('aria-pressed', 'true')
  })
})

test.describe('proyectos', () => {
  test('se filtran por tipo de solución e industria', async ({ page }) => {
    await page.goto('/proyectos')
    const list = page.locator('#lista-proyectos')
    await page.getByRole('button', { name: /^CCTV/ }).click()
    await expect(list.locator('h2')).toHaveText(['Videovigilancia en centro de distribución'])
    await page.locator('#f-industria').selectOption('corporativos')
    await expect(list.getByText('No hay casos con esa combinación de filtros.')).toBeVisible()
    await list.getByRole('button', { name: 'Quitar filtros' }).click()
    await expect(list.locator('h2')).toHaveCount(PROJECTS.length)
  })

  test('los tipos de proyecto no se indexan ni muestran cliente, fecha ni resultados', async ({ page }) => {
    await page.goto(`/proyectos/${PROJECTS[0].slug}`)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
    await expect(page.getByText('Caso demostrativo')).toHaveCount(0)
    await expect(page.locator('main dl').getByText(/^(Cliente|Estado)$/)).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Resultados documentados' })).toHaveCount(0)
  })
})

test.describe('explorador de soluciones', () => {
  test('la portada abre el explorador con el escenario elegido', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Conectividad entre edificios/ }).click()
    await expect(page).toHaveURL('/explorador?escenario=edificios')
    // Con el escenario ya elegido, el explorador pasa a la siguiente pregunta y lo muestra en el resumen.
    await expect(page.getByText('¿Qué tipo de instalación es?')).toBeVisible()
    await expect(page.locator('aside').getByRole('button', { name: 'Conectividad entre edificios' })).toBeVisible()
  })

  test('recorre las seis preguntas, sugiere servicios y lleva el resumen al cotizador', async ({ page }) => {
    await page.goto('/explorador')
    const main = page.locator('main')
    const next = main.getByRole('button', { name: 'Continuar' })
    await next.click()
    await expect(main.getByRole('alert')).toHaveText('Elige una opción para continuar.')
    await main.getByText('Nueva planta industrial', { exact: true }).click()
    await next.click()
    await main.getByText('Planta industrial', { exact: true }).click()
    await next.click()
    await main.getByText('Otro estado de México', { exact: true }).click()
    await next.click()
    await main.getByText('Más de 10,000 m² o varios edificios', { exact: true }).click()
    await next.click()
    await main.getByText('Obra en curso', { exact: true }).click()
    await next.click()
    await main.getByText('Control de asistencia', { exact: true }).click()
    await main.getByRole('button', { name: 'Ver resultado' }).click()

    await expect(main.getByRole('heading', { name: 'Con base en tu solicitud, estos servicios podrían ser relevantes para tu proyecto.' })).toBeVisible()
    // Proyecto grande: la ingeniería va primero; además se sugiere lo marcado y la cobertura se confirma.
    await expect(main.locator('a[href="/soluciones/diseno-e-ingenieria"]').first()).toBeVisible()
    await expect(main.locator('a[href="/soluciones/control-de-asistencia"]')).toBeVisible()
    await expect(main.getByText('Programa de obra y fechas de acceso al sitio')).toBeVisible()
    await expect(main.getByText('La cobertura fuera del área metropolitana de Monterrey se confirma con el equipo comercial.')).toBeVisible()
    await expect(page).toHaveURL(/escenario=nueva-planta.*extras=asistencia/)

    await main.getByRole('link', { name: 'Solicitar asesoría con este resumen' }).click()
    await expect(page).toHaveURL(/\/contacto\?escenario=nueva-planta/)
    const form = page.locator('main')
    await expect(form.getByText('Desde: Explorador: Nueva planta industrial')).toBeVisible()
    expect(await form.locator('input[type=checkbox]:checked').count()).toBeGreaterThanOrEqual(3)
    await form.getByRole('button', { name: 'Continuar' }).click()
    await expect(form.getByText('Resumen del explorador')).toBeVisible()
    await expect(form.getByText('Escenario: Nueva planta industrial')).toBeVisible()
    await expect(form.getByRole('button', { name: 'Planta industrial' })).toHaveAttribute('aria-pressed', 'true')
  })
})

test.describe('idiomas', () => {
  test('cada idioma tiene su ruta, su lang y textos propios', async ({ page }) => {
    for (const [path, lang, h1] of [['/en', 'en', 'The infrastructure that connects your operation.'], ['/ko', 'ko', '귀사의 운영을 연결하는 인프라.'], ['/zh-CN', 'zh-CN', '连接您运营的基础设施。']]) {
      await page.goto(path)
      await expect(page.locator('html')).toHaveAttribute('lang', lang)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1)
      // Traducción sin revisión lingüística: no se indexa todavía.
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
    }
  })

  test('el selector conserva la página, recuerda la preferencia y los enlaces quedan en el idioma', async ({ page, isMobile }) => {
    test.skip(isMobile, 'el selector de escritorio; el móvil se prueba en «menú móvil»')
    await page.goto('/soluciones/control-de-acceso')
    await page.getByRole('button', { name: /Cambiar idioma/ }).click()
    await page.locator('#selector-idioma').getByRole('link', { name: /한국어/ }).click()
    await expect(page).toHaveURL('/ko/soluciones/control-de-acceso')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('출입 통제')
    expect(await page.evaluate(() => localStorage.getItem('idioma'))).toBe('ko')
    await page.getByRole('navigation', { name: '주 메뉴' }).getByRole('link', { name: '문의' }).click()
    await expect(page).toHaveURL('/ko/contacto')
    await expect(page.locator('main').getByText('어떤 작업이 필요하십니까?')).toBeVisible()
    await page.goBack()
    await expect(page).toHaveURL('/ko/soluciones/control-de-acceso')
  })

  test('formularios y validaciones en el idioma de la página', async ({ page }) => {
    await page.goto('/zh-CN/contacto')
    const form = page.locator('main')
    await form.getByRole('button', { name: '继续' }).click()
    await expect(form.getByRole('alert')).toHaveText('请至少选择一项。')
    await page.goto('/en/contacto')
    await page.locator('main').getByRole('button', { name: 'Continue' }).click()
    await expect(page.locator('main').getByRole('alert')).toHaveText('Select at least one option.')
  })

  test('una ruta inexistente en otro idioma muestra la 404 en ese idioma', async ({ page }) => {
    await page.goto('/en/does-not-exist')
    await expect(page.getByRole('heading', { name: 'This page does not exist.' })).toBeVisible()
  })

  test('sugiere el idioma del navegador sin redirigir', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'ko-KR', viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    await page.goto('/nosotros')
    await expect(page).toHaveURL('/nosotros')
    const hint = page.getByRole('link', { name: '이 페이지를 한국어로 보기' })
    await expect(hint).toBeVisible()
    await hint.click()
    await expect(page).toHaveURL('/ko/nosotros')
    await ctx.close()
  })
})

test.describe('centro técnico', () => {
  test('los borradores se ven en desarrollo, marcados y sin indexar', async ({ page }) => {
    test.skip(!!process.env.BASE_URL, 'publicado no hay borradores')
    await page.goto('/recursos')
    await expect(page.getByRole('link', { name: /Cat6 vs Cat6A/ })).toBeVisible()
    await page.getByRole('link', { name: /Cat6 vs Cat6A/ }).click()
    await expect(page).toHaveURL('/recursos/cat6-vs-cat6a')
    await expect(page.getByRole('note')).toContainText('Borrador pendiente de revisión técnica')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
    await expect(page.locator('article').getByRole('table').first()).toBeVisible()
  })
})

test.describe('WhatsApp flotante', () => {
  test('en escritorio aparece al pasar la portada y se oculta junto al cotizador y al explorador', async ({ page, isMobile }) => {
    test.skip(isMobile, 'en móvil no hay botón flotante')
    await page.goto('/')
    await expect(fab(page)).toHaveCSS('visibility', 'hidden')
    // Durante el recorrido fijo de la portada tampoco aparece (taparía su índice); después de él, sí.
    await page.locator('#soluciones').scrollIntoViewIfNeeded()
    await expect(fab(page)).toBeVisible()
    await expect(fab(page)).toHaveAttribute('href', /^https:\/\/wa\.me\/528180871700\?text=/)
    await page.goto('/soluciones/fibra-optica')
    await page.locator('[aria-label="Progreso de la solicitud"]').scrollIntoViewIfNeeded()
    // Oculto también para el teclado y el lector de pantalla (visibility), no sólo transparente.
    await expect(fab(page)).toHaveCSS('opacity', '0')
    await expect(fab(page)).toHaveCSS('visibility', 'hidden')
    await page.goto('/contacto')
    await expect(fab(page)).toHaveCount(0)
  })

  test('en el teléfono no hay botón flotante', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'sólo móvil')
    await page.goto('/nosotros')
    await page.mouse.wheel(0, 1400)
    await expect(fab(page)).toBeHidden()
  })
})

// El HTML de cada ruta lo escribe scripts/prerender.mjs en el build; en el servidor de desarrollo no existe.
test.describe('HTML de cada página (sitio publicado)', () => {
  test.skip(!process.env.BASE_URL, 'sólo contra el build publicado (BASE_URL)')
  test('título, descripción e imagen para compartir sin JavaScript', async ({ request }) => {
    for (const { path, seo: { title, description }, noindex, service } of ES_PAGES) {
      const html = await (await request.get(path)).text()
      const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
      expect(html, path).toContain(`<title>${esc(fullTitle(title))}</title>`)
      expect(html, path).toContain(`<meta name="description" content="${esc(description)}"`)
      expect(html, path).toContain('<html lang="es-MX"')
      if (noindex) expect(html, path).toContain('<meta name="robots" content="noindex"')
      const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1]
      expect(og, `${path} og:image`).toMatch(/^https:\/\//)
      if (path === '/') expect((await request.get(og!)).status(), 'og:image responde').toBe(200)
      expect(html, `${path} og:image:alt`).toContain('<meta property="og:image:alt"')
      // Datos estructurados: empresa y sitio en todas; servicio y ruta de navegación donde aplica.
      const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1])
      const types = ld['@graph'].map((n: { '@type': string }) => n['@type'])
      expect(types, path).toEqual(expect.arrayContaining(['LocalBusiness', 'WebSite']))
      if (service) expect(types, path).toContain('Service')
      if (path !== '/') expect(types, path).toContain('BreadcrumbList')
    }
    const en = await (await request.get('/en/soluciones/fibra-optica')).text()
    expect(en).toContain('<html lang="en"')
    expect(en).toContain('<meta name="robots" content="noindex"')
  })

  test('sitemap, robots, íconos y redirecciones', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap.match(/<loc>/g)).toHaveLength(ES_PAGES.filter((p) => !p.noindex).length)
    expect(sitemap).toContain('/soluciones/redes-empresariales</loc>')
    expect(sitemap).not.toContain('/en/')
    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toContain('Disallow: /api/')
    expect(robots).toMatch(/Sitemap: https:\/\/\S+\/sitemap\.xml/)
    for (const icon of ['/favicon.ico', '/apple-touch-icon.png']) {
      const res = await request.get(icon)
      expect(res.status(), icon).toBe(200)
      expect(res.headers()['cache-control'], icon).toContain('max-age=86400')
    }
    for (const [from, to] of [['/soluciones/switching-routing', /\/soluciones\/redes-empresariales$/], ['/es/contacto', /\/contacto$/], ['/zh-cn', /\/zh-CN$/]] as const) {
      const old = await request.get(from, { maxRedirects: 0 })
      expect(old.status(), from).toBe(308)
      expect(old.headers().location, from).toMatch(to)
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
    await form.getByRole('textbox', { name: /^Cargo/ }).fill('Jefa de TI')
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
    for (const part of ['Para: ffacundo@interfaz.com.mx, ventas@interfaz.com.mx', 'Responder a: ana@empresa.mx', 'Asunto: Nueva solicitud de cotización | Interfaz Redes | Fibra óptica', 'Adjuntos: plano nave.pdf', 'Nombre: Ana López Muñoz', 'Cargo: Jefa de TI', 'Ubicación: Planta industrial · Apodaca, N.L.', 'Incluye 8 cámaras en andenes.']) {
      expect(ventas).toContain(part)
    }
    expect(ventas).not.toContain('Idioma del cliente')
    expect(readFileSync(`.cotizaciones-prueba/${folio}-ventas.html`, 'utf8')).toContain('NUEVA SOLICITUD DE COTIZACIÓN')
    expect(readFileSync(`.cotizaciones-prueba/${folio}-acuse.txt`, 'utf8')).toContain(`Folio: ${folio}`)
    expect(ventas).toContain('los envió una persona externa')
    // El acuse no repite texto libre del formulario (no sirve para mandar mensajes a terceros).
    const acuse = readFileSync(`.cotizaciones-prueba/${folio}-acuse.txt`, 'utf8')
    expect(acuse).toContain('Hola, Ana:')
    expect(acuse).toContain('Tipo de inmueble: Planta industrial')
    expect(acuse).not.toContain('Apodaca')
    expect(acuse).not.toContain('Jefa de TI')
    const aviso = readFileSync(`.cotizaciones-prueba/${folio}-whatsapp.txt`, 'utf8')
    expect(aviso).toContain('*NUEVA COTIZACIÓN — INTERFAZ REDES*')
    expect(aviso).toContain(`Folio: ${folio}`)
    expect(aviso).toContain('{{9}} Enlace de fibra entre dos naves a 180 m. · Incluye 8 cámaras en andenes.')
  })

  test('en inglés: la confirmación y el acuse salen en inglés y ventas lo recibe en español', async ({ page }) => {
    test.skip(!!process.env.BASE_URL, 'sólo en local')
    await page.goto('/en/contacto')
    const form = page.locator('main')
    await form.getByText('Fiber optics', { exact: true }).click()
    await form.getByRole('button', { name: 'Continue' }).click()
    await form.getByRole('button', { name: 'Industrial plant' }).click()
    await form.getByRole('textbox', { name: 'City or general location' }).fill('Apodaca, N.L.')
    await form.getByRole('textbox', { name: 'Describe your need' }).fill('Fiber link between two plant buildings, 180 m.')
    await form.getByRole('button', { name: 'Continue' }).click()
    await form.getByRole('textbox', { name: 'Name' }).fill('John Smith')
    await form.getByRole('textbox', { name: 'Company' }).fill('Test Company')
    await form.getByRole('textbox', { name: 'Business email' }).fill('john@company.com')
    await form.getByRole('textbox', { name: 'WhatsApp' }).fill('+1 512 555 0100')
    await form.getByRole('button', { name: 'Review request' }).click()
    await page.waitForTimeout(3000)
    await form.getByRole('button', { name: 'Send request' }).click()
    await expect(form.getByRole('heading', { name: 'Request received' })).toBeVisible()
    const folio = (await form.getByText(/^Reference COT-/).textContent())!.replace('Reference ', '').trim()
    const acuse = readFileSync(`.cotizaciones-prueba/${folio}-acuse.txt`, 'utf8')
    expect(acuse).toContain('Hello John,')
    expect(acuse).toContain('Requested service: Fiber optics')
    expect(acuse).toContain('Facility type: Industrial plant')
    const ventas = readFileSync(`.cotizaciones-prueba/${folio}-ventas.txt`, 'utf8')
    expect(ventas).toContain('Idioma del cliente: Inglés')
    expect(ventas).toContain('Servicio solicitado: Fibra óptica')
    expect(ventas).toContain('Ubicación: Planta industrial · Apodaca, N.L.')
  })

  test('el resumen del explorador llega a ventas en español', async ({ page }) => {
    test.skip(!!process.env.BASE_URL, 'sólo en local')
    await page.goto('/ko/contacto?escenario=fibra&inmueble=planta&ubicacion=mty&tamano=s&etapa=obra')
    const form = page.locator('main')
    await expect(form.locator('input[type=checkbox]:checked')).toHaveCount(1)
    await form.getByRole('button', { name: '다음' }).click()
    await expect(form.getByText('솔루션 탐색기 요약')).toBeVisible()
    await form.getByRole('textbox', { name: '도시 또는 대략적인 위치' }).fill('Monterrey, N.L.')
    await form.getByRole('textbox', { name: '필요한 내용 설명' }).fill('Fiber backbone for a new plant building.')
    await form.getByRole('button', { name: '다음' }).click()
    await form.getByRole('textbox', { name: '이름' }).fill('Kim Minsu')
    await form.getByRole('textbox', { name: '회사명' }).fill('Test Korea')
    await form.getByRole('textbox', { name: '회사 이메일' }).fill('kim@test.kr')
    await form.getByRole('textbox', { name: 'WhatsApp' }).fill('+52 81 1234 5678')
    await form.getByRole('button', { name: '요청 내용 확인' }).click()
    await page.waitForTimeout(3000)
    await form.getByRole('button', { name: '요청 보내기' }).click()
    await expect(form.getByRole('heading', { name: '요청이 접수되었습니다' })).toBeVisible()
    const folio = (await form.getByText(/^접수 번호 COT-/).first().textContent())!.replace('접수 번호 ', '').trim()
    const ventas = readFileSync(`.cotizaciones-prueba/${folio}-ventas.txt`, 'utf8')
    expect(ventas).toContain('Idioma del cliente: Coreano')
    expect(ventas).toContain('Referencia: Explorador: Instalación de fibra óptica')
    expect(ventas).toContain('Explorador de soluciones:\nEscenario: Instalación de fibra óptica')
    expect(ventas).toContain('Etapa: Obra en curso')
    expect(readFileSync(`.cotizaciones-prueba/${folio}-acuse.txt`, 'utf8')).toContain('견적 요청을 접수했습니다')
  })

  test('el servidor valida y rechaza envíos no permitidos', async ({ request, baseURL }) => {
    test.skip(!!process.env.BASE_URL, 'sólo en local')
    const ok = { types: 'fibra', location: 'Apodaca', description: 'Enlace de fibra entre dos naves.', name: 'Ana López', company: 'Empresa', email: 'ana@empresa.mx', phone: '8112345678', elapsed: '9000' }
    const post = (multipart: Record<string, string | { name: string; mimeType: string; buffer: Buffer }>, origin: string | null = baseURL!, lang = '') =>
      request.post(`/api/cotizacion${lang ? `?lang=${lang}` : ''}`, { multipart, headers: origin ? { Origin: origin } : {} })

    expect((await post(ok, null)).status(), 'sin origen').toBe(403)
    expect((await post(ok, 'https://otro-sitio.com')).status(), 'otro origen').toBe(403)
    const invalid = await post({ ...ok, email: 'ana@', phone: '81' })
    expect(invalid.status()).toBe(400)
    expect(Object.keys((await invalid.json()).errores)).toEqual(['email', 'phone'])
    // Los mensajes salen en el idioma de la solicitud.
    const invalidEn = await (await post({ ...ok, email: 'ana@' }, baseURL!, 'en')).json()
    expect(invalidEn.mensaje).toBe('Please check the request details.')
    expect(invalidEn.errores.email).toBe('Check the email format, for example name@company.com.')
    expect((await (await post({ ...ok, hp_ref: 'https://spam.example' })).json()).codigo, 'campo trampa').toBe('rechazada')
    expect((await (await post({ ...ok, elapsed: '500' })).json()).codigo, 'demasiado rápido').toBe('rechazada')
    const fake = await post({ ...ok, files: { name: 'plano.pdf', mimeType: 'application/pdf', buffer: Buffer.from('no es un pdf') } })
    expect((await fake.json()).codigo, 'archivo falso').toBe('archivos')
    const longRole = await post({ ...ok, role: 'R'.repeat(200) })
    expect(longRole.status()).toBe(413)
    expect(Object.keys((await longRole.json()).errores)).toEqual(['role'])
  })

  test('sin recepción automática el cotizador sigue con WhatsApp y correo', async ({ page }) => {
    await page.route('**/api/cotizacion', (r) => r.fulfill({ json: { recepcion: false } }))
    const form = await fillQuote(page)
    await expect(form.getByRole('button', { name: 'Enviar solicitud' })).toHaveCount(0)
    await expect(form.getByRole('link', { name: 'Enviar por WhatsApp' })).toBeVisible()
    await expect(form.getByRole('button', { name: 'Copiar solicitud' })).toBeVisible()
  })

  test('si el servidor falla no muestra éxito', async ({ page }) => {
    await page.route('**/api/cotizacion*', (r) =>
      r.request().method() === 'GET'
        ? r.fulfill({ json: { recepcion: true, whatsapp: false } })
        : r.fulfill({ status: 502, json: { ok: false, codigo: 'entrega', mensaje: 'No pudimos entregar su solicitud al equipo comercial.' } }),
    )
    const form = await fillQuote(page)
    await form.getByRole('button', { name: 'Enviar solicitud' }).click()
    await expect(form.getByRole('alert')).toContainText('No se pudo enviar la solicitud.')
    await expect(form.getByText('No se envió. Sus datos siguen aquí.')).toBeVisible()
    await expect(form.getByRole('heading', { name: 'Solicitud recibida' })).toHaveCount(0)
    await expect(form.getByRole('button', { name: 'Intentar de nuevo' })).toBeVisible()
    await expect(form.getByRole('link', { name: 'Enviar por WhatsApp' })).toBeVisible()
  })

  test('sin conexión no intenta enviar y conserva los datos', async ({ page, context }) => {
    await page.route('**/api/cotizacion*', (r) => r.fulfill({ json: { recepcion: true, whatsapp: false } }))
    const form = await fillQuote(page)
    await context.setOffline(true)
    await form.getByRole('button', { name: 'Enviar solicitud' }).click()
    await expect(form.getByRole('alert')).toContainText('Su dispositivo no tiene conexión a internet.')
    await context.setOffline(false)
    await form.getByRole('button', { name: 'Editar contacto' }).click()
    await expect(form.getByRole('textbox', { name: 'Correo corporativo' })).toHaveValue('ana@empresa.mx')
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
    // `inert` se aplica (y se quita) justo después de pintar el menú.
    const inert = () => page.locator('#contenido').evaluate((el) => el.hasAttribute('inert'))
    await expect.poll(inert).toBe(true)
    await page.keyboard.press('Escape')
    await expect(page.locator('#menu-movil')).toBeHidden()
    await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeFocused()
    await expect.poll(inert).toBe(false)
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
    page.route('**/api/cotizacion*', (r) => (r.request().method() === 'GET' ? r.fulfill({ json: { recepcion: true, whatsapp: true } }) : reply(r)))

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

// Interfaz 3.0: experiencia cinematográfica. El contenido y los controles funcionan igual en todos los niveles
// (full: escritorio con mouse · lite: teléfono · reduced: «reducir movimiento»); el movimiento sólo los presenta.
test.describe('Interfaz 3.0', () => {
  test('hero: titular y botones disponibles desde el primer momento', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/')
    const hero = page.locator('section[aria-labelledby="hero-title"]')
    await expect(hero.getByRole('heading', { level: 1 })).toHaveText('La infraestructura que conecta tu operación.')
    const cta = hero.getByRole('link', { name: 'Solicitar cotización' })
    await expect(cta).toHaveAttribute('href', '/contacto')
    await cta.click({ timeout: 2000 })
    await expect(page).toHaveURL('/contacto')
    expect(errors).toEqual([])
  })

  test('recorrido: escenario fijo en escritorio, capítulos apilados en el teléfono', async ({ page, isMobile }) => {
    await page.goto('/')
    const journey = page.locator('#recorrido')
    await expect(journey.locator('article.jc')).toHaveCount(4)
    if (isMobile) {
      await expect(journey).not.toHaveClass(/journey-stage/)
      await page.locator('#capitulo-2').scrollIntoViewIfNeeded()
      await expect(page.locator('#capitulo-2-t')).toBeInViewport()
      return
    }
    await expect(journey).toHaveClass(/journey-ready/)
    // El índice del recorrido lleva a cada capítulo y lo activa.
    await journey.locator('a[data-rail="2"]').click()
    await expect(page.locator('#capitulo-3')).toHaveClass(/is-active/, { timeout: 8000 })
    await expect(page.locator('#capitulo-3-t')).toBeVisible()
    await expect(page.locator('#capitulo-1 .jc-copy')).toBeHidden()
  })

  test('recorrido con «reducir movimiento»: sin escenario fijo, todo legible', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()
    await page.goto('/')
    await expect(page.locator('#recorrido')).not.toHaveClass(/journey-stage/)
    for (const id of ['capitulo-1-t', 'capitulo-4-t']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded()
      await expect(page.locator(`#${id}`)).toBeVisible()
    }
    await ctx.close()
  })

  test('explorador de soluciones: pestañas con teclado y cotización del servicio elegido', async ({ page }) => {
    await page.goto('/')
    const tabs = page.getByRole('tablist', { name: 'Frentes técnicos' })
    const panel = page.locator('#sv-panel')
    await tabs.getByRole('tab', { name: 'Fibra óptica' }).click()
    await expect(tabs.getByRole('tab', { name: 'Fibra óptica' })).toHaveAttribute('aria-selected', 'true')
    await expect(panel.getByRole('heading', { level: 3 })).toHaveText('Fibra óptica')
    await expect(panel.getByRole('link', { name: 'Cotizar fibra óptica' })).toHaveAttribute('href', '/contacto?servicio=fibra-optica')
    await page.keyboard.press('ArrowRight')
    await expect(tabs.getByRole('tab', { name: 'Redes empresariales' })).toBeFocused()
    await expect(panel.getByRole('heading', { level: 3 })).toHaveText('Redes empresariales')
    await panel.getByRole('link', { name: 'Cotizar redes empresariales' }).click()
    await expect(page).toHaveURL('/contacto?servicio=redes-empresariales')
  })

  test('explora una instalación: la lista explica cada componente, con o sin 3D', async ({ page }) => {
    for (const url of ['/', '/?experiencia=lite']) {
      await page.goto(url)
      const sec = page.locator('section[aria-labelledby="instalacion-title"]')
      await sec.scrollIntoViewIfNeeded()
      // Empieza en la vista general: nada que restablecer.
      const reset = sec.getByRole('button', { name: 'Restablecer vista' })
      await expect(reset).toBeDisabled()
      await expect(sec.getByText('Un cuarto de telecomunicaciones completo').filter({ visible: true })).toBeVisible()
      await sec.getByRole('button', { name: 'UPS' }).click()
      await expect(sec.getByRole('button', { name: 'UPS' })).toHaveAttribute('aria-pressed', 'true')
      await expect(sec.getByText('Mantiene encendido el equipo crítico').filter({ visible: true })).toBeVisible()
      await expect(sec.getByRole('link', { name: /Energía y respaldo/ })).toHaveAttribute('href', '/soluciones/calidad-de-energia')
      if (url.includes('lite')) {
        await expect(sec.locator('canvas')).toHaveCount(0)
        // Sin 3D, la vista fija de la misma escena cambia con la pieza elegida.
        await expect(sec.locator('img.rack-still')).toHaveAttribute('src', /ups/)
      }
      // Restablecer vuelve a la vista general.
      await reset.click()
      await expect(sec.getByRole('button', { name: 'UPS' })).toHaveAttribute('aria-pressed', 'false')
      await expect(sec.getByText('Un cuarto de telecomunicaciones completo').filter({ visible: true })).toBeVisible()
      await expect(reset).toBeDisabled()
    }
  })

  test('el sitio no muestra leyendas de «imagen de referencia» ni de «caso demostrativo»', async ({ page }) => {
    for (const path of ['/', '/soluciones/cableado-estructurado', '/proyectos', `/proyectos/${PROJECTS[0].slug}`, '/industrias', '/industrias/cedis']) {
      await page.goto(path)
      await expect(page.getByText(/imagen de referencia|representación ilustrativa|caso demostrativo|casos demostrativos/i)).toHaveCount(0)
    }
  })

  test('industrias: los paneles se expanden y llevan a la página del sector', async ({ page }) => {
    await page.goto('/')
    const panels = page.locator('.ind-panels')
    await panels.scrollIntoViewIfNeeded()
    const tab = panels.getByRole('button', { name: /Centros de distribución/ })
    await tab.click()
    await expect(tab).toHaveAttribute('aria-expanded', 'true')
    await panels.getByRole('link', { name: 'Soluciones para centros de distribución y logística' }).click()
    await expect(page).toHaveURL('/industrias/cedis')
  })

  test('escena final: el llamado a la acción y el contacto en todas las páginas que la usan', async ({ page }) => {
    for (const path of ['/', '/soluciones', '/nosotros']) {
      await page.goto(path)
      const cta = page.locator('section[aria-labelledby="cta-title"]')
      await cta.scrollIntoViewIfNeeded()
      await expect(cta.getByRole('heading', { level: 2 })).toHaveText('Hablemos de tu próximo proyecto.')
      await expect(cta.getByRole('link', { name: 'Solicitar cotización' })).toHaveAttribute('href', '/contacto')
    }
  })
})

// Operación SEO Monterrey: medición de cotizaciones, datos estructurados y páginas municipales (borradores).
test.describe('medición y SEO local', () => {
  test('el municipio se reconoce en «Ubicación» sin enviar el texto escrito', () => {
    expect(municipioDe('Apodaca, N.L.')).toBe('Apodaca')
    expect(municipioDe('Parque industrial en San Pedro Garza García')).toBe('San Pedro Garza García')
    expect(municipioDe('García, NL')).toBe('García')
    expect(municipioDe('Escobedo, cerca de Monterrey')).toBe('General Escobedo')
    expect(municipioDe('Cd. Juárez, Chihuahua')).toBe('otro')
    expect(municipioDe('Saltillo, Coahuila')).toBe('otro')
    expect(municipioDe('   ')).toBe('no_indicado')
  })

  test('generate_lead sólo cuando el servidor recibe la solicitud; el envío manual no cuenta', async ({ page }) => {
    await page.route('**/api/cotizacion*', (r) => (r.request().method() === 'GET'
      ? r.fulfill({ json: { recepcion: true, whatsapp: true } })
      : r.fulfill({ json: { ok: true, folio: 'COT-261027-LEADOK', fecha: 'hoy', estados: { correo: 'enviado', whatsapp: 'enviado', acuse: 'enviado' } } })))
    await page.goto('/contacto?servicio=fibra-optica')
    const form = page.locator('main')
    await expect(form.getByRole('checkbox', { name: /Fibra óptica/ })).toBeChecked()
    await form.getByRole('button', { name: 'Continuar' }).click()
    await form.getByRole('textbox', { name: 'Ciudad o ubicación general' }).fill('Apodaca, N.L.')
    await form.getByRole('textbox', { name: 'Describa la necesidad' }).fill('Enlace de fibra entre dos naves a 180 m.')
    await form.getByRole('button', { name: 'Continuar' }).click()
    await form.getByRole('textbox', { name: 'Nombre' }).fill('Ana López')
    await form.getByRole('textbox', { name: 'Empresa' }).fill('Empresa de Prueba')
    await form.getByRole('textbox', { name: 'Correo corporativo' }).fill('ana@empresa.mx')
    await form.getByRole('textbox', { name: 'WhatsApp' }).fill('81 1234 5678')
    await form.getByRole('button', { name: 'Revisar solicitud' }).click()
    const events = () => page.evaluate(() => ((window as unknown as { dataLayer?: unknown[] }).dataLayer ?? []).filter((e): e is Record<string, unknown> => typeof e === 'object' && e !== null && 'event' in e))

    // Abrir WhatsApp con la solicitud escrita no confirma que se haya enviado (se evita abrir la ventana en la prueba).
    await page.evaluate(() => window.addEventListener('click', (e) => e.preventDefault()))
    await form.getByRole('link', { name: 'Enviar por WhatsApp' }).first().click()
    expect((await events()).filter((e) => e.event === 'quote_handoff')).toEqual([expect.objectContaining({ method: 'whatsapp', tipos: 'fibra' })])
    expect((await events()).some((e) => e.event === 'generate_lead')).toBe(false)

    await form.getByRole('button', { name: 'Enviar solicitud' }).click()
    await expect(form.getByRole('heading', { name: 'Solicitud recibida' })).toBeVisible()
    const leads = (await events()).filter((e) => e.event === 'generate_lead')
    expect(leads).toEqual([expect.objectContaining({ method: 'formulario', folio: 'COT-261027-LEADOK', tipos: 'fibra', servicio: 'fibra-optica', origen: 'contacto', municipio: 'Apodaca', idioma: 'es' })])
    // Sin datos personales ni texto escrito por el cliente.
    const sent = JSON.stringify(await events())
    for (const pii of ['Ana', 'ana@empresa.mx', '1234 5678', 'Empresa de Prueba', 'Enlace de fibra', 'N.L.']) expect(sent).not.toContain(pii)
    expect(await page.evaluate(() => sessionStorage.getItem('cotizacion-medidas'))).toContain('COT-261027-LEADOK')
  })

  test('datos estructurados: cobertura como lugares, contacto comercial y temas', async ({ request }) => {
    test.skip(!process.env.BASE_URL, 'el JSON-LD lo escribe el prerender: sólo contra un build (BASE_URL)')
    const html = await (await request.get('/')).text()
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1])['@graph'] as Record<string, unknown>[]
    const business = graph.find((n) => n['@type'] === 'LocalBusiness')!
    expect(business.areaServed).toEqual([{ '@type': 'City', name: 'Monterrey' }, { '@type': 'AdministrativeArea', name: 'Área metropolitana de Monterrey' }])
    expect(business.contactPoint).toMatchObject({ '@type': 'ContactPoint', contactType: 'sales', availableLanguage: ['es'] })
    expect(business.knowsAbout).toEqual(expect.arrayContaining(['Cableado estructurado', 'Fibra óptica']))
    expect((business.address as Record<string, string>).postalCode).toBe('64440')
    // Los borradores del centro técnico no llevan Article.
    expect(graph.some((n) => n['@type'] === 'Article')).toBe(false)
  })

  test('servicios y Nosotros muestran la cobertura confirmada', async ({ page }) => {
    await page.goto('/soluciones/fibra-optica')
    await expect(page.locator('#cotizar').getByText('Monterrey y área metropolitana, Nuevo León.')).toBeVisible()
    await page.goto('/nosotros')
    const where = page.locator('section[aria-labelledby="donde-trabajamos"]')
    await expect(where.getByRole('heading', { name: 'Dónde trabajamos' })).toBeVisible()
    await expect(where.getByText('Av. 8 Norte #1750, Col. Industrial, C.P. 64440, Monterrey, N.L.')).toBeVisible()
  })

  test('páginas municipales: borradores sin indexar, fuera del sitemap y nunca en producción', async ({ page, request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap).not.toContain('/zonas/')
    if (process.env.BASE_URL) {
      expect((await request.get('/zonas/apodaca')).status()).toBe(404)
      return
    }
    await page.goto('/zonas/apodaca')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Redes, fibra óptica y videovigilancia para empresas en Apodaca')
    await expect(page.getByRole('note')).toContainText('no se publica ni se indexa')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
    await expect(page.locator('#cotizar').getByRole('button', { name: 'Continuar' })).toBeVisible()
  })
})
