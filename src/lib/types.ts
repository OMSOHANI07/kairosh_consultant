import type { Category } from '../content/services'

export type { Category }

export type PortfolioLink = {
  id: string
  category: Category
  title: string
  url: string
  description: string | null
  thumbnail_url: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

export type Testimonial = {
  id: string
  category: Category
  client_name: string
  company: string | null
  quote: string
  rating: number
  photo_url: string | null
  featured: boolean
  display_order: number
  is_active: boolean
}

export type LeadStatus = 'new' | 'contacted' | 'closed'

export type Lead = {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  visitor_id: string | null
  status: LeadStatus
  notes: string | null
  created_at: string
}

export type EventType =
  | 'page_view'
  | 'time_on_page'
  | 'portfolio_click'
  | 'cta_click'
  | 'contact_submit'
  | 'login_popup_shown'
  | 'login_popup_dismissed'
  | 'login_completed'

export type TrackEvent = {
  id: number
  visitor_id: string | null
  session_id: string | null
  event_type: EventType
  path: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export type Session = {
  id: string
  visitor_id: string
  started_at: string
  ended_at: string
  landing_page: string | null
  referrer: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
}

export type VisitorRow = {
  visitor_id: string
  customer_id: string | null
  email: string | null
  phone: string | null
  phone_verified: boolean | null
  first_seen: string
  last_seen: string
  sessions: number
  total_seconds: number
  source: string
  device: string | null
  country: string | null
  city: string | null
}

export type Overview = {
  page_views: number
  unique_visitors: number
  customers: number
  new_customers: number
  sessions: number
  avg_session_seconds: number
  bounce_rate: number
  leads: number
  popup_shown: number
  popup_completed: number
  per_day: { day: string; visitors: number; views: number }[]
  top_pages: { path: string; views: number }[]
  top_referrers: { source: string; sessions: number }[]
  devices: { device: string; visitors: number }[]
}
