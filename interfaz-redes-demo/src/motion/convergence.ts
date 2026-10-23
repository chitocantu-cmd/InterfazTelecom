import { useEffect, type RefObject } from 'react'
import { detectTier } from './experience'

/**
 * Fondo de la escena final: conexiones que llegan desde los bordes y convergen al centro (donde está el llamado a
 * la acción), con pulsos de luz que viajan hacia adentro. Canvas 2D, sin bibliotecas.
 * Sólo dibuja mientras se ve; con «reducir movimiento» dibuja una vez, sin pulsos.
 */
export function useConvergence(ref: RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const still = detectTier() === 'reduced'
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0, raf = 0, visible = false
    type Line = { p: [number, number][]; speed: number; offset: number; width: number }
    let lines: Line[] = []

    const build = () => {
      const r = canvas.getBoundingClientRect()
      w = r.width; h = r.height
      // Sin tamaño (aún sin acomodar, o desmontándose) no hay nada que dibujar.
      if (!w || !h) { lines = []; return }
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Puntos de origen repartidos en el contorno, con un poco de variación determinista.
      const n = w < 700 ? 18 : 30
      const cx = w / 2, cy = h * 0.5
      lines = Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + 0.13 * Math.sin(i * 3.7)
        const R = Math.hypot(w, h) * 0.62
        const sx = cx + Math.cos(a) * R, sy = cy + Math.sin(a) * R
        // Entra recto y dobla en ángulo hacia el centro, como un tendido de canalización.
        const mx = cx + Math.cos(a) * R * 0.42, my = cy + Math.sin(a) * R * 0.42
        const ex = cx + Math.cos(a) * Math.min(w, h) * 0.18, ey = cy + Math.sin(a) * Math.min(w, h) * 0.12
        return { p: [[sx, sy], [mx, sy * 0.35 + my * 0.65], [ex, ey]], speed: 0.06 + ((i * 7) % 5) * 0.012, offset: (i * 0.137) % 1, width: i % 4 === 0 ? 1.4 : 1 }
      })
    }

    const point = (l: Line, t: number): [number, number] => {
      // Recorrido por tramos rectos (t de 0 a 1 sobre la longitud total).
      const seg = l.p.slice(1).map((q, i) => Math.hypot(q[0] - l.p[i][0], q[1] - l.p[i][1]))
      const total = seg.reduce((s, x) => s + x, 0)
      if (!total) return l.p[0]
      let d = t * total
      for (let i = 0; i < seg.length; i++) {
        if (d <= seg[i] && seg[i] > 0) { const k = d / seg[i]; return [l.p[i][0] + (l.p[i + 1][0] - l.p[i][0]) * k, l.p[i][1] + (l.p[i + 1][1] - l.p[i][1]) * k] }
        d -= seg[i]
      }
      return l.p[l.p.length - 1]
    }

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h)
      for (const l of lines) {
        ctx.beginPath()
        ctx.moveTo(l.p[0][0], l.p[0][1])
        for (const q of l.p.slice(1)) ctx.lineTo(q[0], q[1])
        ctx.strokeStyle = 'rgba(120, 190, 235, 0.13)'
        ctx.lineWidth = l.width
        ctx.stroke()
        const end = l.p[l.p.length - 1]
        ctx.fillStyle = 'rgba(76, 195, 240, 0.55)'
        ctx.beginPath(); ctx.arc(end[0], end[1], 1.6, 0, Math.PI * 2); ctx.fill()
        if (still) continue
        // Pulso que viaja hacia el centro.
        const t = (now / 1000 * l.speed + l.offset) % 1
        const [x, y] = point(l, t)
        const g = ctx.createRadialGradient(x, y, 0, x, y, 16)
        g.addColorStop(0, 'rgba(120, 214, 255, 0.95)'); g.addColorStop(1, 'rgba(38, 165, 220, 0)')
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill()
      }
    }

    const loop = (now: number) => { draw(now); raf = visible && !still ? requestAnimationFrame(loop) : 0 }
    build(); draw(performance.now())
    const ro = new ResizeObserver(() => { build(); draw(performance.now()) })
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf && !still) raf = requestAnimationFrame(loop)
    })
    io.observe(canvas)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() }
  }, [ref])
}
