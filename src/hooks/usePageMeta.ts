import { useEffect } from 'react'
import { site } from '../config/site'
import seo from '../content/seo.json'

type Meta = { title?: string; description?: string; path?: string; noindex?: boolean }

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

/** Sets the document title, description, canonical URL, Open Graph and robots tags. */
export function usePageMeta({ title, description, path, noindex }: Meta) {
  useEffect(() => {
    const entry = path ? (seo as Record<string, { title: string; description: string }>)[path] : undefined
    const t = title ?? entry?.title ?? site.name
    const d = description ?? entry?.description ?? site.tagline
    // Trailing slash matches how GitHub Pages serves each page (no redirect).
    const url = site.url + (path && path !== '/' ? `${path}/` : '/')

    document.title = t
    setMeta('name', 'description', d)
    setMeta('property', 'og:title', t)
    setMeta('property', 'og:description', d)
    setMeta('property', 'og:url', url)
    setMeta('name', 'twitter:title', t)
    setMeta('name', 'twitter:description', d)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url
  }, [title, description, path, noindex])
}
