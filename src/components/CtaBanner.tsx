import { Asterisk } from 'lucide-react'
import { PillLink } from './CtaLink'

export function CtaBanner({ title, text, location }: { title: string; text: string; location: string }) {
  return (
    <section className="container-page py-16">
      <div className="relative overflow-hidden rounded-3xl bg-brand-900 px-6 py-14 text-center sm:px-12">
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent-400/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-accent-400/10" aria-hidden="true" />
        <h2 className="relative text-3xl text-white sm:text-4xl">{title}</h2>
        <p className="relative mx-auto mt-3 max-w-xl text-brand-100">{text}</p>
        <PillLink to="/contact" track={location} className="relative mt-8">
          Book a Free Consultation
        </PillLink>
      </div>
    </section>
  )
}

/** Small "✱ Label" chip shown above section headings. */
export function Chip({ children, dark = false }: { children: string; dark?: boolean }) {
  return (
    <span className={dark ? 'chip bg-white/10 text-white ring-white/15' : 'chip'}>
      <Asterisk className={`h-3.5 w-3.5 ${dark ? 'text-accent-400' : 'text-ink'}`} strokeWidth={3} aria-hidden="true" />
      {children}
    </span>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = 'center',
  dark = false,
}: {
  eyebrow?: string
  title: string
  intro?: string
  align?: 'center' | 'split'
  dark?: boolean
}) {
  if (align === 'split') {
    return (
      <div className="mb-12 grid gap-6 lg:grid-cols-2 lg:items-end">
        <div>
          {eyebrow && <Chip dark={dark}>{eyebrow}</Chip>}
          <h2 className={`mt-4 text-3xl leading-tight sm:text-4xl ${dark ? 'text-white' : ''}`}>{title}</h2>
        </div>
        {intro && <p className={`max-w-md lg:justify-self-end ${dark ? 'text-brand-100' : 'text-slate-600'}`}>{intro}</p>}
      </div>
    )
  }
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      {eyebrow && <Chip dark={dark}>{eyebrow}</Chip>}
      <h2 className={`mt-4 text-3xl leading-tight sm:text-4xl ${dark ? 'text-white' : ''}`}>{title}</h2>
      {intro && <p className={`mt-3 ${dark ? 'text-brand-100' : 'text-slate-600'}`}>{intro}</p>}
    </div>
  )
}

/** Dark banner used at the top of inner pages (About, Services, Contact, Privacy). */
export function PageHero({
  eyebrow,
  title,
  text,
  image,
  children,
}: {
  eyebrow: string
  title: string
  text?: string
  image?: string
  children?: React.ReactNode
}) {
  return (
    <section className="relative overflow-hidden bg-brand-950">
      {image && (
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" decoding="async" fetchPriority="high" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/90 to-brand-950/40" aria-hidden="true" />
      <div className="container-page relative py-16 sm:py-24">
        <Chip dark>{eyebrow}</Chip>
        <h1 className="mt-5 max-w-3xl text-4xl leading-tight text-white uppercase sm:text-5xl">{title}</h1>
        {text && <p className="mt-5 max-w-2xl text-lg text-brand-100">{text}</p>}
        {children}
      </div>
    </section>
  )
}
