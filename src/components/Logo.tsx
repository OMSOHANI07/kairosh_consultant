import { site } from '../config/site'

/** PLACEHOLDER logo: replace the SVG with your own mark (also update public/favicon.svg). */
export function Logo({ className = '', light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="9" className="fill-accent-400" />
        <path d="M10 8v16M10 16l9-8M12.5 14l7.5 10" className="stroke-brand-950" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
      <span className={`text-lg font-bold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>{site.name}</span>
    </span>
  )
}
