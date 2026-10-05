import { Mail, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { site } from '../config/site'
import { services } from '../content/services'
import { PillLink } from './CtaLink'
import { Logo } from './Logo'

export function Footer({ onCookieSettings }: { onCookieSettings: () => void }) {
  return (
    <footer className="bg-brand-950 text-brand-100">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm text-brand-200">{site.tagline}.</p>
          <PillLink to="/contact" className="mt-6" track="footer">
            Book a Free Consultation
          </PillLink>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">Company</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-accent-400" to="/about">About us</Link></li>
            {Object.values(services).map((s) => (
              <li key={s.path}><Link className="hover:text-accent-400" to={s.path}>{s.navLabel}</Link></li>
            ))}
            <li><Link className="hover:text-accent-400" to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">Get in touch</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a className="inline-flex items-center gap-2 hover:text-accent-400" href={`mailto:${site.email}`}>
                <Mail className="h-4 w-4 text-accent-400" /> {site.email}
              </a>
            </li>
            <li className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent-400" /> {site.location}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-brand-200 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-accent-400">Privacy Policy</Link>
            <button type="button" onClick={onCookieSettings} className="hover:text-accent-400">
              Cookie settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
