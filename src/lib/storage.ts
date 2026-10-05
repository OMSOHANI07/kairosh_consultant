// localStorage wrapper that never throws (private mode, blocked storage…).

export const keys = {
  consent: 'kc_consent',
  visitorId: 'kc_visitor_id',
  session: 'kc_session',
  attribution: 'kc_attribution',
  geo: 'kc_geo',
  customer: 'kc_customer',
  loginTimer: 'kc_login_timer',
} as const

export function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function setItem(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable */
  }
}

export function removeItem(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* storage unavailable */
  }
}
