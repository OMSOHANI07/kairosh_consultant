import { Mail, MapPin, Phone } from 'lucide-react'
import { ContactForm } from '../components/ContactForm'
import { site } from '../config/site'
import { usePageMeta } from '../hooks/usePageMeta'

export default function Contact() {
  usePageMeta({ path: '/contact' })

  return (
    <section className="bg-gradient-to-b from-brand-50 to-white">
      <div className="container-page grid gap-10 py-16 sm:py-24 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="eyebrow">Contact</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">Book a free consultation</h1>
          <p className="mt-5 text-lg text-slate-600">
            Tell us a little about your business and what you’d like to build or automate. We’ll get back to you within
            one business day.
          </p>
          <ul className="mt-8 space-y-4 text-slate-700">
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-brand-600" aria-hidden="true" />
              <a href={`mailto:${site.email}`} className="hover:text-brand-700">{site.email}</a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-brand-600" aria-hidden="true" />
              <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="hover:text-brand-700">{site.phone}</a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-brand-600" aria-hidden="true" /> {site.location}
            </li>
          </ul>
        </div>
        <div className="lg:col-span-3">
          <ContactForm source="contact" />
        </div>
      </div>
    </section>
  )
}
