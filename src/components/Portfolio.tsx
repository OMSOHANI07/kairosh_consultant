import { ExternalLink } from 'lucide-react'
import { usePortfolio } from '../hooks/usePublicContent'
import { track } from '../lib/tracking'
import type { Category, PortfolioLink } from '../lib/types'
import { CardSkeleton, EmptyState } from './Skeleton'

function initials(title: string) {
  return title
    .replace(/^sample:\s*/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

function PortfolioCard({ item }: { item: PortfolioLink }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('portfolio_click', { id: item.id, title: item.title, url: item.url, category: item.category })}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-video overflow-hidden bg-gradient-to-br from-brand-100 to-brand-50">
        {item.thumbnail_url ? (
          <img
            src={item.thumbnail_url}
            alt=""
            loading="lazy"
            decoding="async"
            width={640}
            height={360}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl font-bold text-brand-600/60">
            {initials(item.title)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg">{item.title}</h3>
        {item.description && <p className="mt-1 flex-1 text-sm text-slate-600">{item.description}</p>}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
          Visit site <ExternalLink className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </span>
      </div>
    </a>
  )
}

export function PortfolioGrid({ category }: { category: Category }) {
  const { data, loading, error } = usePortfolio(category)

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {Array.from({ length: 3 }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }
  if (error) return <EmptyState title="Projects could not be loaded right now." text="Please refresh the page." />
  if (!data.length) return <EmptyState title="New projects coming soon." text="Check back shortly or get in touch to see examples." />

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((item) => (
        <PortfolioCard key={item.id} item={item} />
      ))}
    </div>
  )
}
