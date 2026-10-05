import { BadgeCheck, Bot, CheckCircle2, Clock, Handshake, IndianRupee, LifeBuoy, MonitorSmartphone, Phone, Star, Target } from 'lucide-react'
import { ContactForm } from '../components/ContactForm'
import { Chip, SectionHeading } from '../components/CtaBanner'
import { PillLink } from '../components/CtaLink'
import { AiIllustration } from '../components/illustrations/AiIllustration'
import { WebsiteIllustration } from '../components/illustrations/WebsiteIllustration'
import { Reveal } from '../components/Reveal'
import { TestimonialCarousel } from '../components/Testimonials'
import { site } from '../config/site'
import { about } from '../content/about'
import { home } from '../content/home'
import { services } from '../content/services'
import { usePageMeta } from '../hooks/usePageMeta'
import { useSiteStats } from '../hooks/usePublicContent'

const approachIcons = { website: MonitorSmartphone, ai: Bot, consult: Handshake } as const
const whyIcons = [Target, Clock, IndianRupee, LifeBuoy]

const cardStyles = [
  { card: 'bg-white', title: 'text-ink', text: 'text-slate-600', icon: 'text-ink', pill: 'outline' as const },
  { card: 'bg-accent-400', title: 'text-ink', text: 'text-ink/75', icon: 'text-ink', pill: 'dark' as const },
  { card: 'bg-brand-900', title: 'text-white', text: 'text-brand-100', icon: 'text-accent-400', pill: 'lime' as const },
]

function Stars({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <span className="flex gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`${className} fill-accent-400 text-accent-400`} />
      ))}
    </span>
  )
}

function Hero() {
  const stats = useSiteStats()
  const { hero } = home
  return (
    <section className="relative isolate overflow-hidden bg-brand-950">
      <picture>
        <source media="(min-width: 768px)" srcSet={hero.image} />
        <img
          src={hero.imageMobile}
          alt={hero.imageAlt}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[70%_center] md:left-auto md:w-[62%]"
        />
      </picture>
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950 from-35% via-brand-950/85 via-55% to-brand-950/10 max-md:bg-brand-950/80"
        aria-hidden="true"
      />

      <div className="container-page py-20 sm:py-28 lg:py-32">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/15">
            {stats.reviewCount > 0 ? (
              <>
                <span className="font-semibold">{stats.avgRating.toFixed(1)}</span>
                <Stars className="h-3.5 w-3.5" />
                <span>{stats.reviewCount} client reviews</span>
              </>
            ) : (
              <>
                <BadgeCheck className="h-4 w-4 text-accent-400" aria-hidden="true" /> {hero.badge}
              </>
            )}
          </span>

          <h1 className="mt-6 text-4xl leading-[1.05] font-extrabold text-white uppercase sm:text-6xl lg:text-7xl">
            {hero.titleBefore} <span className="whitespace-nowrap text-accent-400">{hero.highlight}</span> {hero.titleAfter}
          </h1>
          <p className="mt-6 max-w-lg text-base text-brand-100 sm:text-lg">{hero.subtitle}</p>

          <div className="mt-9 flex flex-wrap items-center gap-6">
            <PillLink to="/contact" track="home-hero" className="py-2 pl-6 text-base">
              {hero.primaryCta}
            </PillLink>
            <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="group inline-flex items-center gap-3 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-400 text-ink transition group-hover:bg-accent-300">
                <Phone className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="leading-tight">
                <span className="block text-xs tracking-wide text-brand-200 uppercase">Call us</span>
                <span className="font-semibold">{site.phone}</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Approach() {
  const { approach } = home
  return (
    <section className="bg-cream py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading eyebrow={approach.eyebrow} title={approach.title} intro={approach.intro} align="split" />
        <div className="grid gap-6 md:grid-cols-3">
          {approach.cards.map((c, i) => {
            const s = cardStyles[i % cardStyles.length]
            const Icon = approachIcons[c.icon as keyof typeof approachIcons] ?? CheckCircle2
            return (
              <Reveal as="article" key={c.title} delay={i * 140} className={`relative overflow-hidden rounded-3xl p-8 pb-24 ${s.card}`}>
                {i === 1 && <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-accent-500/60" aria-hidden="true" />}
                <Icon className={`h-10 w-10 ${s.icon}`} strokeWidth={1.5} aria-hidden="true" />
                <h3 className={`mt-8 text-xl ${s.title}`}>{c.title}</h3>
                <p className={`mt-3 text-sm ${s.text}`}>{c.text}</p>
                {/* Notch in the bottom-left corner that holds the button */}
                <div className="absolute bottom-0 left-0 rounded-tr-3xl bg-cream pt-3 pr-3">
                  <PillLink to={c.to} variant={s.pill} className="py-1 pl-4 text-xs">
                    Explore More<span className="sr-only">: {c.title}</span>
                  </PillLink>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function WhoWeAre() {
  const { whoWeAre: w } = home
  const stats = useSiteStats()
  const founder = about.team.members[0]
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2">
        {/* Photo collage */}
        <Reveal className="grid grid-cols-5 gap-4">
          <img src={w.imageMain} alt={w.imageMainAlt} loading="lazy" decoding="async" width={900} height={560} className="col-span-5 aspect-[16/10] w-full rounded-3xl object-cover" />
          <div className="col-span-2 flex flex-col items-center justify-center rounded-3xl bg-accent-400 p-5 text-center text-ink">
            <CheckCircle2 className="h-9 w-9 fill-ink text-accent-400" aria-hidden="true" />
            <p className="mt-3 text-3xl font-extrabold">{stats.loading ? '—' : `${stats.projectCount}+`}</p>
            <p className="mt-1 text-sm font-medium">Projects in our portfolio</p>
          </div>
          <img src={w.imageSmall} alt={w.imageSmallAlt} loading="lazy" decoding="async" width={500} height={500} className="col-span-3 aspect-[4/3] w-full rounded-3xl object-cover" />
        </Reveal>

        {/* Text + stat tiles */}
        <Reveal delay={150}>
          <Chip>{w.eyebrow}</Chip>
          <h2 className="mt-4 text-3xl leading-tight sm:text-4xl">{w.title}</h2>
          <p className="mt-4 text-slate-600">{w.text}</p>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <PillLink to="/about" variant="outline">More About Us</PillLink>
            {founder && (
              <div className="flex items-center gap-3">
                {founder.photoUrl ? (
                  <img src={founder.photoUrl} alt="" className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-900 font-semibold text-accent-400">
                    {founder.name.charAt(0)}
                  </span>
                )}
                <span className="leading-tight">
                  <span className="block font-semibold text-ink">{founder.name}</span>
                  <span className="text-xs text-slate-500">{founder.role} — {site.shortName}</span>
                </span>
              </div>
            )}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-cream p-6">
              <Stars />
              <p className="mt-4 text-4xl font-extrabold text-ink">
                {stats.reviewCount ? stats.avgRating.toFixed(1) : '—'}
                <span className="text-base font-medium text-slate-600">/5.0</span>
              </p>
              <p className="mt-3 text-sm font-medium text-ink">Avg. client rating</p>
            </div>
            <div className="rounded-3xl bg-cream p-6">
              <p className="font-semibold text-ink">{w.skillsTitle}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {w.skills.map((s) => (
                  <li key={s} className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold tracking-wide text-ink uppercase ring-1 ring-slate-200">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Services() {
  const items = [
    { s: services.website, Icon: MonitorSmartphone, Art: WebsiteIllustration },
    { s: services.ai, Icon: Bot, Art: AiIllustration },
  ]
  return (
    <section id="services" className="scroll-mt-24 bg-brand-950 py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading eyebrow={home.servicesEyebrow} title={home.servicesTitle} align="split" dark />
        <div className="grid gap-6 lg:grid-cols-2">
          {items.map(({ s, Icon, Art }, i) => (
            <Reveal as="article" key={s.path} delay={i * 150} className="flex flex-col rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 sm:p-8">
              <div className="mb-6 rounded-2xl bg-gradient-to-br from-brand-800/80 to-brand-950 p-4 sm:p-6">
                <Art />
              </div>
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-400 text-ink">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="text-2xl text-white">{s.navLabel}</h3>
              </div>
              <ul className="mt-6 grid flex-1 gap-3 sm:grid-cols-2">
                {s.offerings.map((o) => (
                  <li key={o.title} className="flex items-start gap-2 text-sm text-brand-100">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" /> {o.title}
                  </li>
                ))}
              </ul>
              <PillLink to={s.path} className="mt-8 self-start">
                Learn more<span className="sr-only"> about {s.navLabel}</span>
              </PillLink>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Why() {
  return (
    <section className="bg-cream py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading eyebrow={home.whyEyebrow} title={home.whyHeading} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {home.why.map((w, i) => {
            const Icon = whyIcons[i] ?? CheckCircle2
            return (
              <Reveal key={w.title} delay={i * 120} className="rounded-3xl bg-white p-7 hover:-translate-y-1 hover:shadow-lg">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-900 text-accent-400">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-lg">{w.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{w.description}</p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  usePageMeta({ path: '/' })
  const { finalCta } = home

  return (
    <>
      <Hero />
      <Approach />
      <WhoWeAre />
      <Services />
      <Why />

      <section className="py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading eyebrow={home.testimonialsEyebrow} title={home.testimonialsHeading} />
          <TestimonialCarousel />
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 bg-brand-950 py-20 sm:py-24">
        <div className="container-page grid items-start gap-12 lg:grid-cols-2">
          <div>
            <Chip dark>{finalCta.eyebrow}</Chip>
            <h2 className="mt-4 text-3xl text-white uppercase sm:text-5xl">{finalCta.title}</h2>
            <p className="mt-4 text-brand-100">{finalCta.text}</p>
            <ul className="mt-8 space-y-3 text-brand-50">
              {finalCta.points.map((t) => (
                <li key={t} className="flex items-center gap-3">
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
