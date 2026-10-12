import { defineConfig, devices } from '@playwright/test'

// Pruebas de navegador del sitio. Usa el Google Chrome instalado en el equipo
// (PW_CHANNEL=msedge para Microsoft Edge), así no hace falta descargar navegadores.
// BASE_URL=https://interfaz-redes.vercel.app prueba el sitio publicado en lugar del local.
const PORT = 5199
const channel = process.env.PW_CHANNEL ?? 'chrome'
const external = process.env.BASE_URL

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: external ?? `http://localhost:${PORT}`, channel, trace: 'retain-on-failure' },
  projects: [
    { name: 'escritorio', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'movil', use: { ...devices['Pixel 7'], channel } },
  ],
  webServer: external
    ? undefined
    : {
        command: `npx vite --port ${PORT} --strictPort`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: true,
        timeout: 60_000,
      },
})
