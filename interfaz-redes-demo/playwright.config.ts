import { defineConfig, devices } from '@playwright/test'

// Pruebas de navegador del sitio. Usa el Google Chrome instalado en el equipo
// (PW_CHANNEL=msedge para Microsoft Edge), así no hace falta descargar navegadores.
const PORT = 5199
const channel = process.env.PW_CHANNEL ?? 'chrome'

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: `http://localhost:${PORT}`, channel, trace: 'retain-on-failure' },
  projects: [
    { name: 'escritorio', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'movil', use: { ...devices['Pixel 7'], channel } },
  ],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
