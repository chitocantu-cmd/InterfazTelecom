import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { fullTitle, type Seo } from '../data/seo'

export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || 'https://interfaztelecom.com.mx'

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** Título, descripción, canonical y Open Graph por página (textos en src/data/seo.ts). */
export function useSeo({ title, description }: Seo) {
  const { pathname } = useLocation()
  useEffect(() => {
    const full = fullTitle(title)
    document.title = full
    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[property="og:title"]', 'property', 'og:title', full)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    const url = SITE_URL + (pathname === '/' ? '/' : pathname)
    setMeta('meta[property="og:url"]', 'property', 'og:url', url)
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = url
  }, [title, description, pathname])
}
