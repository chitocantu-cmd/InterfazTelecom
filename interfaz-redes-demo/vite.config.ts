import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { Readable } from 'node:stream'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { COMPANY } from './src/data/company'

// Una sola URL del sitio: COMPANY.site (también la usa el servidor para aceptar envíos del cotizador).
// VITE_SITE_URL sólo sirve para sobrescribirla en un build puntual; de aquí la leen index.html y lib/seo.ts.
process.env.VITE_SITE_URL ||= COMPANY.site.replace(/\/$/, '')

/**
 * En desarrollo, atiende /api/<nombre> con la función de api/<nombre>.ts (como Vercel en producción),
 * con las variables de .env y .env.local disponibles en process.env.
 */
function localApi(): Plugin {
  return {
    name: 'api-local',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, '')
      for (const [k, v] of Object.entries(env)) process.env[k] ??= v
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/api\/([\w-]+)(?:[?#]|$)/)
        if (!match) return next()
        const json = (status: number, body: unknown) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(body))
        }
        // Como en Vercel: una función que no existe es un 404 (no la página de error de Vite).
        if (!existsSync(resolve(server.config.root, 'api', `${match[1]}.ts`))) return json(404, { ok: false, codigo: 'no_existe' })
        try {
          const mod = await server.ssrLoadModule(`/api/${match[1]}.ts`)
          const handler = mod[req.method ?? 'GET'] as ((r: Request) => Response | Promise<Response>) | undefined
          if (!handler) {
            res.setHeader('Allow', Object.keys(mod).filter((k) => /^[A-Z]+$/.test(k)).join(', '))
            return json(405, { ok: false, codigo: 'metodo' })
          }
          const headers = new Headers()
          for (const [k, v] of Object.entries(req.headers)) if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(', ') : v)
          if (!headers.has('x-forwarded-for') && req.socket.remoteAddress) headers.set('x-forwarded-for', req.socket.remoteAddress)
          const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
          const request = new Request(`http://${req.headers.host}${req.url}`, {
            method: req.method,
            headers,
            body: hasBody ? (Readable.toWeb(req) as ReadableStream) : undefined,
            ...(hasBody ? { duplex: 'half' } : {}),
          } as RequestInit)
          const response = await handler(request)
          res.statusCode = response.status
          response.headers.forEach((v, k) => res.setHeader(k, v))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (e) {
          // El detalle va a la terminal; al navegador, sólo un error genérico (como en producción).
          server.config.logger.error(`api/${match[1]}: ${e instanceof Error ? e.stack : String(e)}`)
          if (!res.headersSent) json(500, { ok: false, codigo: 'servidor' })
        }
      })
    },
  }
}

// `vite build`                 → producción para Vercel (dist/, archivos con hash y caché larga)
// `vite build --mode preview`  → un solo HTML autocontenido para la vista previa (dist-preview/)
export default defineConfig(({ mode }) => {
  const single = mode === 'preview'
  return {
    plugins: [react(), localApi(), ...(single ? [viteSingleFile()] : [])],
    // Sólo el sitio: tools/renders/ tiene su propio index.html (three.js) que no forma parte de la app.
    optimizeDeps: { entries: ['index.html'] },
    build: single
      ? { outDir: 'dist-preview', target: 'es2020', cssCodeSplit: false, assetsInlineLimit: 100_000_000 }
      : // El manifiesto dice qué archivos JS usa cada página; prerender.mjs los precarga y luego lo borra.
        { outDir: 'dist', target: 'es2020', assetsInlineLimit: 4096, sourcemap: false, manifest: true },
  }
})
