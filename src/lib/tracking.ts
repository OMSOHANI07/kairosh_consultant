// =============================================================================
// Visitor tracking.
//
// Before cookie consent (or if declined): only an anonymous `page_view` with
// the path is recorded: no visitor ID, no session, no device or location.
//
// After consent: a persistent visitor_id (localStorage), sessions that expire
// after 30 minutes of inactivity, device/browser/screen, referrer + UTM,
// approximate country/city, time on page and interaction events.
// =============================================================================
import { features } from '../config/site'
import { deviceInfo } from './device'
import { insert, rpc } from './api'
import { getItem, keys, removeItem, setItem } from './storage'
import type { EventType } from './types'

export type Consent = 'accepted' | 'declined'

type StoredSession = { id: string; startedAt: number; lastActivity: number }
type Geo = { country?: string; city?: string }

const SESSION_TIMEOUT_MS = features.SESSION_TIMEOUT_MINUTES * 60_000
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const

// Captured once, on the page load that started this visit.
const landing = (() => {
  const params = new URLSearchParams(location.search)
  const utm: Record<string, string> = {}
  for (const k of UTM_KEYS) {
    const v = params.get(k)
    if (v) utm[k] = v
  }
  let referrer = ''
  try {
    if (document.referrer && new URL(document.referrer).host !== location.host) referrer = document.referrer
  } catch {
    /* malformed referrer */
  }
  return { utm, referrer, path: location.pathname }
})()
let landingUsed = false

const uuid = () =>
  crypto.randomUUID?.() ??
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })

// --- consent ------------------------------------------------------------------

export const getConsent = () => getItem<Consent>(keys.consent)

export function setConsent(value: Consent) {
  setItem(keys.consent, value)
  if (value === 'declined') {
    // Forget identifiers if the visitor withdraws consent.
    removeItem(keys.visitorId)
    removeItem(keys.session)
    removeItem(keys.geo)
  }
}

const tracking = () => getConsent() === 'accepted'

// --- identity -----------------------------------------------------------------

export function getVisitorId(): string | null {
  if (!tracking()) return null
  let id = getItem<string>(keys.visitorId)
  if (!id) {
    id = uuid()
    setItem(keys.visitorId, id)
  }
  return id
}

async function getGeo(): Promise<Geo> {
  const cached = getItem<Geo>(keys.geo)
  if (cached) return cached
  if (!features.GEO_IP_URL) return {}
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 2500)
    const res = await fetch(features.GEO_IP_URL, { signal: ctrl.signal })
    clearTimeout(t)
    const json = await res.json()
    const geo: Geo = { country: json.country ?? json.country_name, city: json.city }
    setItem(keys.geo, geo)
    return geo
  } catch {
    return {}
  }
}

let sessionPromise: Promise<{ visitorId: string; sessionId: string } | null> | null = null

/** Returns the active session, starting a new one after 30 min of inactivity. */
function ensureSession() {
  const visitorId = getVisitorId()
  if (!visitorId) return Promise.resolve(null)

  const now = Date.now()
  const stored = getItem<StoredSession>(keys.session)
  if (stored && now - stored.lastActivity < SESSION_TIMEOUT_MS && sessionPromise) {
    stored.lastActivity = now
    setItem(keys.session, stored)
    return sessionPromise
  }
  if (stored && now - stored.lastActivity < SESSION_TIMEOUT_MS) {
    // Same session, new page load (e.g. refresh). Nothing to create.
    stored.lastActivity = now
    setItem(keys.session, stored)
    sessionPromise = Promise.resolve({ visitorId, sessionId: stored.id })
    return sessionPromise
  }

  const session: StoredSession = { id: uuid(), startedAt: now, lastActivity: now }
  setItem(keys.session, session)
  const attribution = landingUsed ? { utm: {}, referrer: '', path: location.pathname } : landing
  landingUsed = true

  sessionPromise = (async () => {
    const geo = await getGeo()
    const d = deviceInfo()
    await rpc('track_session', {
      p_visitor_id: visitorId,
      p_session_id: session.id,
      p_landing_page: attribution.path,
      p_referrer: attribution.referrer || null,
      p_device: d.device,
      p_browser: d.browser,
      p_os: d.os,
      p_screen: d.screen,
      p_language: d.language,
      p_country: geo.country ?? null,
      p_city: geo.city ?? null,
      p_utm: attribution.utm,
    })
    return { visitorId, sessionId: session.id }
  })()
  return sessionPromise
}

// --- events -------------------------------------------------------------------

export async function track(
  type: EventType,
  metadata: Record<string, unknown> = {},
  opts: { path?: string; keepalive?: boolean } = {},
) {
  const path = opts.path ?? location.pathname
  if (!tracking()) {
    if (type === 'page_view') {
      // Anonymous page count only.
      insert('events', { event_type: 'page_view', path })
    }
    return
  }
  const s = await ensureSession()
  if (!s) return
  await insert(
    'events',
    { visitor_id: s.visitorId, session_id: s.sessionId, event_type: type, path, metadata },
    { keepalive: opts.keepalive },
  )
}

function touch(keepalive = false) {
  const visitorId = getVisitorId()
  const s = getItem<StoredSession>(keys.session)
  if (!visitorId || !s) return
  rpc('touch_session', { p_visitor_id: visitorId, p_session_id: s.id }, { keepalive })
}

// --- page timing --------------------------------------------------------------

let currentPath: string | null = null
let currentTitle = ''
let activeMs = 0
let visibleSince: number | null = null

function flushTimeOnPage(keepalive: boolean) {
  if (visibleSince !== null) {
    activeMs += Date.now() - visibleSince
    visibleSince = document.visibilityState === 'visible' ? Date.now() : null
  }
  const seconds = Math.round(activeMs / 1000)
  activeMs = 0
  if (currentPath && seconds >= 1 && tracking()) {
    track('time_on_page', { seconds, title: currentTitle }, { path: currentPath, keepalive })
  }
}

/** Call on every route change, after the page title has been set. */
export function trackPageView(path: string, title: string) {
  if (path === currentPath) return
  flushTimeOnPage(false)
  currentPath = path
  currentTitle = title
  activeMs = 0
  visibleSince = document.visibilityState === 'visible' ? Date.now() : null
  track('page_view', { title }, { path }).then(() => touch())
}

let listenersBound = false

/** Wires up page-hide handling. Safe to call more than once. */
export function initTracking() {
  if (listenersBound) return
  listenersBound = true

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushTimeOnPage(true)
      touch(true)
    } else {
      visibleSince = Date.now()
    }
  })
  window.addEventListener('pagehide', () => {
    flushTimeOnPage(true)
    touch(true)
  })
}
