// Empaqueta el build de vista previa (un solo HTML) como fragmento para el artifact de Claude.
// Uso: npm run build:preview
import { readFileSync, writeFileSync } from 'node:fs'

let h = readFileSync('dist-preview/index.html', 'utf8')
h = h.replace(/<!doctype html>/i, '').replace(/<\/?html[^>]*>/gi, '').replace(/<\/?head>/gi, '').replace(/<\/?body>/gi, '')
h = h.replace(/<meta charset[^>]*>/i, '').replace(/<meta name="viewport"[^>]*>/i, '')
// Favicon y og-image viven en /public; en un solo HTML se incrustan o se omiten.
const fav = readFileSync('public/favicon.jpg').toString('base64')
h = h.replace(/href="\/favicon\.jpg"/g, `href="data:image/jpeg;base64,${fav}"`)
h = h.replace(/<meta property="og:image"[^>]*>\n?/g, '').replace(/<meta name="twitter:image"[^>]*>\n?/g, '')
const title = h.match(/<title>.*?<\/title>/)[0]
h = title + '\n' + h.replace(title, '').trim() + '\n'
writeFileSync('dist-preview/interfaz-redes.html', h)
console.log('bytes', h.length)
