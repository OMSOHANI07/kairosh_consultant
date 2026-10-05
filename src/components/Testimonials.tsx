import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTestimonials } from '../hooks/usePublicContent'
import type { Category, Testimonial } from '../lib/types'
import { EmptyState, QuoteSkeleton } from './Skeleton'

export function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-accent-400 text-accent-400' : 'text-slate-300'}`}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

function Avatar({ t }: { t: Testimonial }) {
  if (t.photo_url) {
    return <img src={t.photo_url} alt="" loading="lazy" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
  }
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
      {t.client_name.charAt(0)}
    </span>
  )
}

export function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="card flex h-full flex-col p-6">
      <Stars rating={t.rating} />
      <blockquote className="mt-3 flex-1 text-slate-700">“{t.quote}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <Avatar t={t} />
        <div>
          <p className="text-sm font-semibold text-ink">{t.client_name}</p>
          {t.company && <p className="text-xs text-slate-500">{t.company}</p>}
        </div>
      </figcaption>
    </figure>
  )
}

export function TestimonialGrid({ category }: { category: Category }) {
  const { data, loading } = useTestimonials({ category })
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-3" aria-busy="true">
        {Array.from({ length: 3 }, (_, i) => (
          <QuoteSkeleton key={i} />
        ))}
      </div>
    )
  }
  if (!data.length) return <EmptyState title="Client reviews coming soon." />
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {data.map((t) => (
        <TestimonialCard key={t.id} t={t} />
      ))}
    </div>
  )
}

/** Featured testimonials (both categories) shown on the home page. */
export function TestimonialCarousel() {
  const { data, loading } = useTestimonials({ featured: true })
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = data.length

  useEffect(() => {
    if (count < 2 || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), 6000)
    return () => window.clearInterval(id)
  }, [count, paused])

  if (loading) return <QuoteSkeleton />
  if (!count) return <EmptyState title="Client reviews coming soon." />

  const go = (d: number) => setIndex((i) => (i + d + count) % count)
  const t = data[index % count]

  return (
    <div
      className="mx-auto max-w-2xl"
      role="region"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div aria-live={paused ? 'polite' : 'off'}>
        <TestimonialCard key={t.id} t={t} />
      </div>
      {count > 1 && (
        <div className="mt-5 flex items-center justify-center gap-4">
          <button type="button" className="btn-secondary h-10 w-10 p-0" onClick={() => go(-1)} aria-label="Previous testimonial">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-1">
            {data.map((d, i) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show testimonial ${i + 1} of ${count}`}
                aria-current={i === index}
                className="flex h-6 w-6 items-center justify-center"
              >
                <span className={`block h-2 rounded-full transition-all ${i === index ? 'w-5 bg-brand-600' : 'w-2 bg-slate-300'}`} />
              </button>
            ))}
          </div>
          <button type="button" className="btn-secondary h-10 w-10 p-0" onClick={() => go(1)} aria-label="Next testimonial">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}
