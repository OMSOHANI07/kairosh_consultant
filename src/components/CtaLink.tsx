import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { track } from '../lib/tracking'

/** Internal link that records a `cta_click` event. */
export function CtaLink({
  to,
  label,
  location,
  className = 'btn-primary',
  children,
}: {
  to: string
  label: string
  location: string
  className?: string
  children: ReactNode
}) {
  return (
    <Link to={to} className={className} onClick={() => track('cta_click', { label, location, to })}>
      {children}
    </Link>
  )
}
