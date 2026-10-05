import { ArrowRight, Bot, CheckCircle2, Clock, IndianRupee, LifeBuoy, MonitorSmartphone, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ContactForm } from '../components/ContactForm'
import { CtaLink } from '../components/CtaLink'
import { SectionHeading } from '../components/CtaBanner'
import { TestimonialCarousel } from '../components/Testimonials'
import { home } from '../content/home'
import { services } from '../content/services'
import { usePageMeta } from '../hooks/usePageMeta'

const whyIcons = [Target, Clock, IndianRupee, LifeBuoy]

export default function Home() {
  usePageMeta({ path: '/' })

  const cards = [
    { s: services.website, Icon: MonitorSmartphone, text: home.serviceCards.website },
    { s: services.ai, Icon: Bot, text: home.serviceCards.ai },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page py-20 text-center sm:py-28">
          <p className="eyebrow">{home.hero.eyebrow}</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl lg:text-6xl">{home.hero.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">{home.hero.subtitle}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <CtaLink to="/contact" label={home.hero.primaryCta} location="home-hero" className="btn-primary px-6 py-3 text-base">
              {home.hero.primaryCta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </CtaLink>
            <a href="#services" className="btn-secondary px-6 py-3 text-base">
              {home.hero.secondaryCta}
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="container-page scroll-mt-20 py-20">
        <SectionHeading eyebrow="Services" title={home.servicesHeading} intro={home.servicesIntro} />
        <div className="grid gap-6 md:grid-cols-2">
          {cards.map(({ s, Icon, text }) => (
            <article key={s.path} className="card flex flex-col p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-2xl">{s.navLabel}</h3>
              <p className="mt-2 flex-1 text-slate-600">{text}</p>
              <Link to={s.path} className="mt-6 inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-800">
                Learn more<span className="sr-only"> about {s.navLabel}</span> <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-slate-50 py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Why us" title={home.whyHeading} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {home.why.map((w, i) => {
              const Icon = whyIcons[i] ?? CheckCircle2
              return (
                <div key={w.title} className="card p-6">
                  <Icon className="h-7 w-7 text-brand-600" aria-hidden="true" />
                  <h3 className="mt-4 text-lg">{w.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{w.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-page py-20">
        <SectionHeading eyebrow="Testimonials" title={home.testimonialsHeading} />
        <TestimonialCarousel />
      </section>

      {/* Final CTA + contact form */}
      <section id="contact" className="scroll-mt-20 bg-brand-900 py-20">
        <div className="container-page grid items-start gap-10 lg:grid-cols-2">
          <div className="text-white">
            <p className="text-sm font-semibold tracking-wide text-accent-300 uppercase">Free consultation</p>
            <h2 className="mt-2 text-3xl text-white sm:text-4xl">{home.finalCta.title}</h2>
            <p className="mt-4 text-brand-100">{home.finalCta.text}</p>
            <ul className="mt-6 space-y-3 text-brand-50">
              {['No-obligation 30-minute call', 'Clear plan, timeline and fixed quote', 'Websites, AI automation, or both'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent-400" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <ContactForm source="home" />
        </div>
      </section>
    </>
  )
}
