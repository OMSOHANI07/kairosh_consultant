import { CheckCircle2 } from 'lucide-react'
import { CtaBanner, PageHero, SectionHeading } from '../components/CtaBanner'
import { PillLink } from '../components/CtaLink'
import { AiIllustration } from '../components/illustrations/AiIllustration'
import { WebsiteIllustration } from '../components/illustrations/WebsiteIllustration'
import { PortfolioGrid } from '../components/Portfolio'
import { Reveal } from '../components/Reveal'
import { TestimonialGrid } from '../components/Testimonials'
import { services, type Category } from '../content/services'
import { usePageMeta } from '../hooks/usePageMeta'

const heroImage: Record<Category, string> = {
  website: '/images/team-laptops.webp',
  ai: '/images/office.webp',
}

/** Shared template for /services/website and /services/ai. */
export default function ServicePage({ category }: { category: Category }) {
  const s = services[category]
  usePageMeta({ path: s.path })

  return (
    <>
      <PageHero
        eyebrow={s.eyebrow}
        title={s.title}
        text={s.intro}
        image={heroImage[category]}
        aside={category === 'website' ? <WebsiteIllustration /> : <AiIllustration />}
      >
        <PillLink to="/contact" track={`${category}-hero`} className="mt-9 py-2 pl-6 text-base">
          Book a Free Consultation
        </PillLink>
      </PageHero>

      <section className="bg-cream py-20">
        <div className="container-page">
          <SectionHeading eyebrow="What we offer" title="How we can help" align="split" intro={s.ctaText} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {s.offerings.map((o, i) => (
              <Reveal
                key={o.title}
                delay={(i % 3) * 120}
                className={`rounded-3xl p-7 transition-transform hover:-translate-y-1 ${i === 1 ? 'bg-accent-400' : i === 2 ? 'bg-brand-900' : 'bg-white'}`}
              >
                <CheckCircle2 className={`h-7 w-7 ${i === 2 ? 'text-accent-400' : 'text-ink'}`} aria-hidden="true" />
                <h3 className={`mt-5 text-lg ${i === 2 ? 'text-white' : ''}`}>{o.title}</h3>
                <p className={`mt-2 text-sm ${i === 2 ? 'text-brand-100' : i === 1 ? 'text-ink/75' : 'text-slate-600'}`}>
                  {o.description}
                </p>
              </Reveal>
            ))}
          </div>

          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {s.process.map((step, i) => (
              <Reveal as="li" key={step} delay={i * 120} className="flex items-center gap-4 rounded-full bg-white p-2 pr-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-900 font-bold text-accent-400">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-semibold text-ink">{step}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Portfolio" title={s.portfolioHeading} intro={s.portfolioIntro} align="split" />
          <PortfolioGrid category={category} />
        </div>
      </section>

      <section className="bg-cream py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Testimonials" title={s.testimonialsHeading} />
          <TestimonialGrid category={category} />
        </div>
      </section>

      <CtaBanner title={s.ctaTitle} text={s.ctaText} location={`${category}-footer`} />
    </>
  )
}
