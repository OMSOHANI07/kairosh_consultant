import { Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { site } from '../config/site'
import { services } from '../content/services'
import { Logo } from './Logo'
import { GithubIcon, InstagramIcon, LinkedinIcon, XIcon } from './SocialIcons'

const socials = [
  { href: site.social.linkedin, label: 'LinkedIn', Icon: LinkedinIcon },
  { href: site.social.instagram, label: 'Instagram', Icon: InstagramIcon },
  { href: site.social.x, label: 'X (Twitter)', Icon: XIcon },
  { href: site.social.github, label: 'GitHub', Icon: GithubIcon },
].filter((s) => s.href)

export function Footer({ onCookieSettings }: { onCookieSettings: () => void }) {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-slate-600">{site.tagline}.</p>
          <div className="mt-4 flex gap-2">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-brand-700"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink">Company</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link className="hover:text-brand-700" to="/about">About us</Link></li>
            {Object.values(services).map((s) => (
              <li key={s.path}><Link className="hover:text-brand-700" to={s.path}>{s.navLabel}</Link></li>
            ))}
            <li><Link className="hover:text-brand-700" to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink">Get in touch</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a className="inline-flex items-center gap-2 hover:text-brand-700" href={`mailto:${site.email}`}>
                <Mail className="h-4 w-4" /> {site.email}
              </a>
            </li>
            <li>
              <a className="inline-flex items-center gap-2 hover:text-brand-700" href={`tel:${site.phone.replace(/\s/g, '')}`}>
                <Phone className="h-4 w-4" /> {site.phone}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-brand-700">Privacy Policy</Link>
            <button type="button" onClick={onCookieSettings} className="hover:text-brand-700">
              Cookie settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
