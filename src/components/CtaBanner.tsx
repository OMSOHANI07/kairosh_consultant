import { ArrowRight } from 'lucide-react'
import { CtaLink } from './CtaLink'

export function CtaBanner({ title, text, location }: { title: string; text: string; location: string }) {
  return (
    <section className="container-page py-16">
      <div className="overflow-hidden rounded-3xl bg-brand-900 px-6 py-12 text-center sm:px-12">
        <h2 className="text-2xl text-white sm:text-3xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-brand-100">{text}</p>
        <CtaLink
          to="/contact"
          label="Book a Free Consultation"
          location={location}
          className="btn mt-8 bg-accent-400 text-ink hover:bg-accent-300"
        >
          Book a Free Consultation <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </CtaLink>
      </div>
    </section>
  )
}

export function SectionHeading({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-2 text-3xl sm:text-4xl">{title}</h2>
      {intro && <p className="mt-3 text-slate-600">{intro}</p>}
    </div>
  )
}
