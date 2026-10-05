import { ChevronsRight } from 'lucide-react'
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

type PillVariant = 'lime' | 'dark' | 'outline'

const pillClass: Record<PillVariant, string> = {
  lime: 'btn-pill-lime',
  dark: 'btn-pill-dark',
  outline: 'btn-pill-outline',
}
const circleClass: Record<PillVariant, string> = {
  lime: 'bg-ink text-accent-400',
  dark: 'bg-accent-400 text-ink',
  outline: 'bg-accent-400 text-ink',
}

/** Rounded pill button with a circular ">>" badge, as used across the site. */
export function PillLink({
  to,
  children,
  variant = 'lime',
  track: trackAs,
  className = '',
}: {
  to: string
  children: ReactNode
  variant?: PillVariant
  /** When set, clicking records a cta_click event with this location. */
  track?: string
  className?: string
}) {
  return (
    <Link
      to={to}
      className={`${pillClass[variant]} ${className}`}
      onClick={trackAs ? () => track('cta_click', { label: String(children), location: trackAs, to }) : undefined}
    >
      {children}
      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${circleClass[variant]}`} aria-hidden="true">
        <ChevronsRight className="h-4 w-4" />
      </span>
    </Link>
  )
}
