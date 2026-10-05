import { useEffect, useState } from 'react'
import { isConfigured, select } from '../lib/api'
import type { Category, PortfolioLink, Testimonial } from '../lib/types'

type State<T> = { data: T[]; loading: boolean; error: string | null }

function useSelect<T>(table: string, query: string) {
  const [state, setState] = useState<State<T>>({ data: [], loading: isConfigured, error: null })

  useEffect(() => {
    if (!isConfigured) return
    let cancelled = false
    setState((s) => ({ ...s, loading: true }))
    select<T>(table, query).then(({ data, error }) => {
      if (!cancelled) setState({ data: data ?? [], loading: false, error: error?.message ?? null })
    })
    return () => {
      cancelled = true
    }
  }, [table, query])

  return state
}

/** Active portfolio links for a category, in display order (RLS only returns active rows). */
export function usePortfolio(category: Category) {
  return useSelect<PortfolioLink>(
    'portfolio_links',
    `select=*&category=eq.${category}&is_active=is.true&order=display_order.asc,created_at.asc`,
  )
}

export function useTestimonials(opts: { category?: Category; featured?: boolean }) {
  const filters = [
    'select=*',
    'is_active=is.true',
    opts.category && `category=eq.${opts.category}`,
    opts.featured && 'featured=is.true',
    'order=display_order.asc,created_at.asc',
  ]
  return useSelect<Testimonial>('testimonials', filters.filter(Boolean).join('&'))
}
