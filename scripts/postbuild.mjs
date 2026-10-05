// Runs after `vite build`:
//  1. Writes dist/<route>/index.html for every public route with that page's
//     <title>, description, canonical and Open Graph tags baked in. GitHub
//     Pages serves these directly, so social previews and crawlers see the
//     right metadata and refreshes on /services/ai need no 404 redirect.
//  2. Generates dist/sitemap.xml from the same route list.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const SITE = 'https://kairoshconsultants.in'
const seo = JSON.parse(readFileSync(join(root, 'src/content/seo.json'), 'utf8'))
const template = readFileSync(join(dist, 'index.html'), 'utf8')

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function render(path, { title, description }) {
  const url = SITE + (path === '/' ? '/' : path)
  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${esc(description)}`)
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
    '<meta name="robots" content="index, follow" />',
    '<meta name="robots" content="noindex, nofollow" />',
  ),
)

const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.keys(seo)
  .map(
    (p) =>
      `  <url><loc>${SITE}${p === '/' ? '/' : p}</loc><lastmod>${today}</lastmod><priority>${p === '/' ? '1.0' : p.startsWith('/services') ? '0.9' : '0.6'}</priority></url>`,
  )
  .join('\n')}
</urlset>
`
writeFileSync(join(dist, 'sitemap.xml'), sitemap)
console.log(`postbuild: wrote ${Object.keys(seo).length + 1} route pages and sitemap.xml`)
