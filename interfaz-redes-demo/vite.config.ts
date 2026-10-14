import { Readable } from 'node:stream'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

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
        try {
          const mod = await server.ssrLoadModule(`/api/${match[1]}.ts`)
          const handler = mod[req.method ?? 'GET'] as ((r: Request) => Response | Promise<Response>) | undefined
          if (!handler) {
            res.statusCode = 405
            return res.end()
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
          next(e)
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
      : { outDir: 'dist', target: 'es2020', assetsInlineLimit: 4096, sourcemap: false },
  }
})
