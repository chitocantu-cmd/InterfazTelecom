// Función de Vercel: /api/cotizacion
//   GET  → indica si la recepción automática está activa (si no, el cotizador usa el envío manual).
//   POST → recibe la solicitud del cotizador (multipart/form-data). Lógica en server/cotizacion/.
import { handleGet, handlePost } from '../server/cotizacion/index.js'

export function GET() {
  return handleGet()
}

export function POST(request: Request) {
  return handlePost(request)
}
