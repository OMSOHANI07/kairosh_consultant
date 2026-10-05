// Runs after `vite build`:
//  1. Writes dist/<route>/index.html for every public route with that page's
//     <title>, description, canonical and Open Graph tags baked in. GitHub
//     Pages serves these directly, so social previews and crawlers see the
//     right metadata and refreshes on /services/ai need no 404 redirect.
//     Each page also gets crawlable HTML inside #root (its heading, summary
//     and site navigation), replaced by the app as soon as it starts, plus
//     breadcrumb structured data.
//  2. Generates dist/sitemap.xml from the same route list.
//
// GitHub Pages serves /about as /about/ (301), so every canonical, og:url and
// sitemap URL uses the trailing-slash form to avoid pointing at redirects.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const SITE = 'https://kairoshconsultants.in'
const seo = JSON.parse(readFileSync(join(root, 'src/content/seo.json'), 'utf8'))
const template = readFileSync(join(dist, 'index.html'), 'utf8')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const HERO_PRELOAD = /\s*<link rel="preload" as="image" href="\/images\/hero\.webp"[^>]*>/

const pageUrl = (path) => SITE + (path === '/' ? '/' : `${path}/`)

const NAV = [
  ['/', 'Home'],
  ['/about', 'About Kairosh Consultants'],
  ['/services/website', 'Website Building'],
  ['/services/ai', 'AI Automation'],
  ['/contact', 'Contact'],
]

// Plain, real content for crawlers and no-JS visitors. The app replaces it on start.
function fallback(path, { h1, text }) {
  const links = NAV.map(([p, label]) => `<a href="${p === '/' ? '/' : `${p}/`}" style="color:#b7f06e;margin-right:16px">${esc(label)}</a>`).join('')
  return `<div style="min-height:100vh;background:#06231e;color:#fff;font-family:'Plus Jakarta Sans',system-ui,sans-serif;padding:24px">
<nav aria-label="Main">${links}</nav>
<main style="max-width:720px;padding:80px 0"><h1 style="font-size:40px;line-height:1.1;margin:0">${esc(h1)}</h1><p style="color:#d6e9e2;font-size:18px">${esc(text)}</p></main>
</div>`
}

function breadcrumbs(path, h1) {
  if (path === '/') return ''
  const items = [
    { '@type': 'ListItem', position: 1, name: 'Kairosh Consultants', item: `${SITE}/` },
    { '@type': 'ListItem', position: 2, name: h1, item: pageUrl(path) },
  ]
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items })}</script>\n  </head>`
}

function render(path, { title, description, h1, text }) {
  const url = pageUrl(path)
  // Only the home page shows the hero photo, so only it preloads it.
  const base = path === '/' ? template : template.replace(HERO_PRELOAD, '')
  return base
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${esc(description)}`)
    .replace('<div id="root"></div>', h1 ? `<div id="root">${fallback(path, { h1, text })}</div>` : '<div id="root"></div>')
    .replace('</head>', h1 ? breadcrumbs(path, h1) || '</head>' : '</head>')
}

for (const [path, meta] of Object.entries(seo)) {
  const file = path === '/' ? join(dist, 'index.html') : join(dist, path, 'index.html')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, render(path, meta))
}

// /admin gets its own noindex shell so it never relies on the 404 redirect.
mkdirSync(join(dist, 'admin'), { recursive: true })
writeFileSync(
  join(dist, 'admin', 'index.html'),
  render('/admin', { title: 'Admin | Kairosh Consultants', description: 'Admin dashboard' }).replace(
    '<meta name="robots" content="index, follow, max-image-preview:large" />',
    '<meta name="robots" content="noindex, nofollow" />',
  ),
)

const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.keys(seo)
  .map(
    (p) =>
      `  <url><loc>${pageUrl(p)}</loc><lastmod>${today}</lastmod><priority>${p === '/' ? '1.0' : p.startsWith('/services') ? '0.9' : '0.6'}</priority></url>`,
  )
  .join('\n')}
</urlset>
`
writeFileSync(join(dist, 'sitemap.xml'), sitemap)
console.log(`postbuild: wrote ${Object.keys(seo).length + 1} route pages and sitemap.xml`)
