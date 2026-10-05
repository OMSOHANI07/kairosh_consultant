import { site } from '../config/site'

/** PLACEHOLDER logo: replace the SVG with your own mark (also update public/favicon.svg). */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="8" className="fill-brand-600" />
        <path d="M10 8v16M10 16l9-8M12.5 14l7.5 10" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="24" cy="9" r="2.5" className="fill-accent-400" />
      </svg>
      <span className="text-lg font-bold tracking-tight text-ink">{site.name}</span>
    </span>
  )
}
