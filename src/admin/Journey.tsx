import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { db } from '../lib/neon'
import type { Session, TrackEvent } from '../lib/types'
import { formatDateTime, formatDuration } from './dateRange'

type Customer = { id: string; email: string | null; phone: string | null; phone_verified: boolean; created_at: string; last_login: string }
type Visitor = { id: string; customer_id: string | null; device: string | null; browser: string | null; os: string | null; country: string | null; city: string | null; first_referrer: string | null }

const pageName = (path: string | null) =>
  ({ '/': 'Home', '/about': 'About', '/services/website': 'Website Building', '/services/ai': 'AI Automation', '/contact': 'Contact', '/privacy': 'Privacy Policy' })[
    path ?? ''
  ] ?? path ?? 'unknown page'

function sourceLabel(s: Session) {
  if (s.utm_source) return `${s.utm_source}${s.utm_medium ? ` / ${s.utm_medium}` : ''}`
  if (!s.referrer) return 'Direct'
  try {
    return new URL(s.referrer).hostname.replace(/^www\./, '')
  } catch {
    return s.referrer
  }
}

/** Turns a raw event into a readable step, e.g. "Clicked portfolio: XYZ". */
function describe(e: TrackEvent, timeOnPage: Map<string, number>): string | null {
  const m = e.metadata as Record<string, string | number | boolean | undefined>
  switch (e.event_type) {
    case 'page_view': {
      const secs = timeOnPage.get(`${e.session_id}|${e.id}`)
      return `Viewed ${pageName(e.path)}${secs ? ` · ${formatDuration(secs)}` : ''}`
    }
    case 'time_on_page':
      return null // folded into the page view above
    case 'portfolio_click':
      return `Clicked portfolio: ${m.title ?? m.url}`
    case 'cta_click':
      return `Clicked “${m.label}” (${m.location})`
    case 'contact_submit':
      return 'Submitted contact form'
    case 'login_popup_shown':
      return `Login popup shown${m.trigger === 'manual' ? ' (clicked Sign in)' : ''}`
    case 'login_popup_dismissed':
      return 'Dismissed login popup'
    case 'login_completed':
      return `Logged in with ${m.method}${m.verified === false ? ' (unverified)' : ''}`
  }
}

/** Matches each time_on_page event to the preceding page_view of the same path in the same session. */
function attachTimes(events: TrackEvent[]) {
  const map = new Map<string, number>()
  const lastView = new Map<string, TrackEvent>()
  for (const e of events) {
    if (e.event_type === 'page_view') lastView.set(`${e.session_id}|${e.path}`, e)
    if (e.event_type === 'time_on_page') {
      const v = lastView.get(`${e.session_id}|${e.path}`)
      if (v) {
        const key = `${v.session_id}|${v.id}`
        map.set(key, (map.get(key) ?? 0) + Number((e.metadata as { seconds?: number }).seconds ?? 0))
      }
    }
  }
  return map
}

export default function Journey() {
  const { visitorId } = useParams()
  const [state, setState] = useState<{ visitor: Visitor; customer: Customer | null; sessions: Session[]; events: TrackEvent[] } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!visitorId) return
    ;(async () => {
      const { data: visitor, error } = await db.from('visitors').select('*').eq('id', visitorId).single()
      if (error || !visitor) return setError(error?.message ?? 'Visitor not found')
      let customer: Customer | null = null
      let visitorIds = [visitorId]
      if (visitor.customer_id) {
        const [{ data: c }, { data: vs }] = await Promise.all([
          db.from('customers').select('*').eq('id', visitor.customer_id).single(),
          db.from('visitors').select('id').eq('customer_id', visitor.customer_id),
        ])
        customer = c as Customer
        // A customer may have used several browsers/devices: show all of them.
        visitorIds = ((vs as { id: string }[]) ?? []).map((v) => v.id)
      }
      const [{ data: sessions }, { data: events }] = await Promise.all([
        db.from('sessions').select('*').in('visitor_id', visitorIds).order('started_at'),
        db.from('events').select('*').in('visitor_id', visitorIds).order('created_at').order('id').limit(5000),
      ])
      setState({ visitor: visitor as Visitor, customer, sessions: (sessions as Session[]) ?? [], events: (events as TrackEvent[]) ?? [] })
    })()
  }, [visitorId])

  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (!state) return <div className="space-y-3">{Array.from({ length: 5 }, (_, i) => <div key={i} className="skeleton h-12" />)}</div>

  const { visitor, customer, sessions, events } = state
  const times = attachTimes(events)
  const bySession = new Map<string, TrackEvent[]>()
  for (const e of events) {
    const k = e.session_id ?? 'none'
    bySession.set(k, [...(bySession.get(k) ?? []), e])
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/visitors" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> All visitors
      </Link>

      <div className="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs text-slate-500 uppercase">{customer ? 'Customer' : 'Anonymous visitor'}</p>
          <p className="font-semibold text-ink">{customer?.email ?? customer?.phone ?? `${visitor.id.slice(0, 8)}…`}</p>
          {customer?.phone && customer.email && <p className="text-sm">{customer.phone}</p>}
          {customer && !customer.phone_verified && customer.phone && <span className="rounded bg-amber-100 px-1.5 text-xs text-amber-800">phone unverified</span>}
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase">IDs</p>
          <p className="font-mono text-xs break-all">visitor {visitor.id}</p>
          {customer && <p className="font-mono text-xs break-all text-brand-700">customer {customer.id}</p>}
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase">Device</p>
          <p className="text-sm">{[visitor.device, visitor.browser, visitor.os].filter(Boolean).join(' · ') || '—'}</p>
          <p className="text-sm text-slate-500">{[visitor.city, visitor.country].filter(Boolean).join(', ')}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase">Activity</p>
          <p className="text-sm">{sessions.length} sessions · {events.filter((e) => e.event_type === 'page_view').length} page views</p>
        </div>
      </div>

      <h1 className="text-2xl">Customer journey</h1>
      {!sessions.length && <p className="text-sm text-slate-500">No sessions recorded.</p>}

      <ol className="space-y-6">
        {sessions.map((s, i) => {
          const evs = bySession.get(s.id) ?? []
          const duration = (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 1000
          return (
            <li key={s.id} className="card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base">
                  Session {i + 1}: landed on {pageName(s.landing_page)} from {sourceLabel(s)}
                </h2>
                <p className="text-xs text-slate-500">
                  {formatDateTime(s.started_at)} · {formatDuration(duration)}
                </p>
              </div>
              <ol className="mt-4 space-y-2 border-l-2 border-brand-100 pl-4">
                {evs.map((e) => {
                  const text = describe(e, times)
                  if (!text) return null
                  const highlight = ['login_completed', 'contact_submit'].includes(e.event_type)
                  return (
                    <li key={e.id} className="relative text-sm">
                      <span className={`absolute top-1.5 -left-[21px] h-2.5 w-2.5 rounded-full ${highlight ? 'bg-accent-500' : 'bg-brand-500'}`} aria-hidden="true" />
                      <span className={highlight ? 'font-semibold text-ink' : ''}>{text}</span>
                      <span className="ml-2 text-xs text-slate-400">
                        {new Date(e.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </li>
                  )
                })}
                {!evs.length && <li className="text-sm text-slate-400">No events</li>}
              </ol>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
