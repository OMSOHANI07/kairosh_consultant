import { Mail, MapPin } from 'lucide-react'
import { ContactForm } from '../components/ContactForm'
import { PageHero } from '../components/CtaBanner'
import { site } from '../config/site'
import { usePageMeta } from '../hooks/usePageMeta'

const items = [
  { Icon: Mail, label: 'Email us', value: site.email, href: `mailto:${site.email}` },
  { Icon: MapPin, label: 'Based in', value: site.location, href: undefined },
]

export default function Contact() {
  usePageMeta({ path: '/contact' })

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Book a free consultation"
        text="Tell us a little about your business and what you’d like to build or automate. We’ll get back to you within one business day."
        image="/images/meeting.webp"
      />
      <section className="bg-cream py-20">
        <div className="container-page grid gap-10 lg:grid-cols-5">
          <ul className="space-y-4 lg:col-span-2">
            {items.map(({ Icon, label, value, href }) => {
              const body = (
                <>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-400 text-ink">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</span>
                    <span className="font-semibold text-ink">{value}</span>
                  </span>
                </>
              )
              return (
                <li key={label}>
                  {href ? (
                    <a href={href} className="flex items-center gap-4 rounded-3xl bg-white p-5 hover:shadow-md">{body}</a>
                  ) : (
                    <div className="flex items-center gap-4 rounded-3xl bg-white p-5">{body}</div>
                  )}
                </li>
              )
            })}
          </ul>
          <div className="lg:col-span-3">
            <ContactForm source="contact" />
          </div>
        </div>
      </section>
    </>
  )
}
