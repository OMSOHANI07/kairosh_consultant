// Tiny Data API client for the public site. Uses a short-lived ANONYMOUS
// token, so public pages never need to download the full auth SDK (which is
// loaded on demand by ./neon.ts for sign-in and the admin dashboard).
import { NEON_URL } from '../config/site'

export const isConfigured = Boolean(NEON_URL)

function deriveUrls(base: string) {
  const url = new URL(base)
  const [first, ...rest] = url.hostname.split('.')
  const path = url.pathname.replace(/\/+$/, '')
  return {
    auth: `${url.protocol}//${[first, 'neonauth', ...rest].join('.')}${path}/auth`,
    dataApi: `${url.protocol}//${[first, 'apirest', ...rest].join('.')}${path}/rest/v1`,
  }
}

export const urls = deriveUrls(NEON_URL || 'https://ep-missing.config.invalid/neondb')

if (!isConfigured && import.meta.env.DEV) {
  console.warn('VITE_NEON_URL is not set: database features are disabled. Copy .env.example to .env.local.')
}

let token: { value: string; expiresAt: number } | null = null
let pending: Promise<string | null> | null = null

/** Anonymous JWT (cached until 1 minute before expiry). */
export function anonToken(): Promise<string | null> {
  if (!isConfigured) return Promise.resolve(null)
  if (token && Date.now() < token.expiresAt - 60_000) return Promise.resolve(token.value)
  pending ??= fetch(`${urls.auth}/token/anonymous`, { credentials: 'omit' })
    .then((r) => (r.ok ? r.json() : null))
    .then((j: { token: string; expires_at: number } | null) => {
      token = j ? { value: j.token, expiresAt: j.expires_at * 1000 } : null
      return token?.value ?? null
    })
    .catch(() => null)
    .finally(() => {
      pending = null
    })
  return pending
}

type ApiError = { message: string }
type Result<T> = { data: T | null; error: ApiError | null }

async function request<T>(method: 'GET' | 'POST', path: string, body?: unknown, keepalive = false): Promise<Result<T>> {
  if (!isConfigured) return { data: null, error: { message: 'Database not configured' } }
  // During page unload there is no time to fetch a new token, so reuse the cached one.
  const t = keepalive && token ? token.value : await anonToken()
  if (!t) return { data: null, error: { message: 'Could not get an access token' } }
  try {
    const res = await fetch(`${urls.dataApi}/${path}`, {
      method,
      keepalive,
      credentials: 'omit',
      headers: {
        Authorization: `Bearer ${t}`,
        ...(body !== undefined && { 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const text = await res.text()
    const json = text ? JSON.parse(text) : null
    if (!res.ok) return { data: null, error: { message: json?.message ?? `HTTP ${res.status}` } }
    return { data: json as T, error: null }
  } catch (e) {
    return { data: null, error: { message: String(e) } }
  }
}

/** GET /<table>?<PostgREST query>, e.g. select('testimonials', 'select=*&featured=eq.true'). */
export const select = <T>(table: string, query: string) => request<T[]>('GET', `${table}?${query}`)

/** INSERT without reading the row back (anonymous visitors cannot SELECT). */
export const insert = (table: string, row: unknown, opts: { keepalive?: boolean } = {}) =>
  request<null>('POST', table, row, opts.keepalive)

/** Call a Postgres function exposed through the Data API. */
export const rpc = <T>(fn: string, args: unknown, opts: { keepalive?: boolean } = {}) =>
  request<T>('POST', `rpc/${fn}`, args, opts.keepalive)
