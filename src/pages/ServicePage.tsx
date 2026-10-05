import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { CtaBanner, SectionHeading } from '../components/CtaBanner'
import { CtaLink } from '../components/CtaLink'
import { PortfolioGrid } from '../components/Portfolio'
import { TestimonialGrid } from '../components/Testimonials'
import { services, type Category } from '../content/services'
import { usePageMeta } from '../hooks/usePageMeta'

/** Shared template for /services/website and /services/ai. */
export default function ServicePage({ category }: { category: Category }) {
  const s = services[category]
  usePageMeta({ path: s.path })

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page py-16 sm:py-24">
          <p className="eyebrow">{s.eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-4xl leading-tight sm:text-5xl">{s.title}</h1>
          <p className="mt-5 max-w-3xl text-lg text-slate-600">{s.intro}</p>
          <CtaLink to="/contact" label="Book a Free Consultation" location={`${category}-hero`} className="btn-primary mt-8 px-6 py-3 text-base">
            Book a Free Consultation <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </CtaLink>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading eyebrow="What we offer" title="How we can help" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {s.offerings.map((o) => (
            <div key={o.title} className="card p-6">
              <CheckCircle2 className="h-6 w-6 text-brand-600" aria-hidden="true" />
              <h3 className="mt-3 text-lg">{o.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{o.description}</p>
            </div>
          ))}
        </div>

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {s.process.map((step, i) => (
            <li key={step} className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="font-medium text-ink">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container-page">
          <SectionHeading eyebrow="Portfolio" title={s.portfolioHeading} intro={s.portfolioIntro} />
          <PortfolioGrid category={category} />
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading eyebrow="Testimonials" title={s.testimonialsHeading} />
        <TestimonialGrid category={category} />
      </section>

      <CtaBanner title={s.ctaTitle} text={s.ctaText} location={`${category}-footer`} />
    </>
  )
}
