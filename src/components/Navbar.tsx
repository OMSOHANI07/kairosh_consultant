import { CheckCircle2, ChevronDown, Mail, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { site } from '../config/site'
import { home } from '../content/home'
import { services } from '../content/services'
import { useCustomer } from '../lib/customer'
import { PillLink } from './CtaLink'
import { Logo } from './Logo'
import { ScrollProgressBar } from './ScrollEffects'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'text-accent-400' : 'text-white/85 hover:text-white'
  }`

/** Thin lime strip above the navbar. */
function TopBar() {
  return (
    <div className="hidden bg-accent-400 text-xs font-medium text-ink md:block">
      <div className="container-page flex h-9 items-center justify-between">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {home.topBar.tagline}
        </span>
        <a href={`mailto:${site.email}`} className="inline-flex items-center gap-1.5 hover:underline">
          <Mail className="h-4 w-4" aria-hidden="true" /> {site.email}
        </a>
      </div>
    </div>
  )
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const { customer, user, openLogin, signOut } = useCustomer()
  const loggedIn = Boolean(customer || user)

  // Close menus on navigation.
  useEffect(() => {
    setMobileOpen(false)
    setServicesOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!servicesOpen) return
    const onClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setServicesOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setServicesOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [servicesOpen])

  const serviceItems = Object.values(services)
  const servicesActive = pathname.startsWith('/services')

  return (
    <header className="sticky top-0 z-40">
      <TopBar />
      <div className="border-b border-white/10 bg-brand-950/95 backdrop-blur supports-[backdrop-filter]:bg-brand-950/85">
        <nav className="container-page flex h-16 items-center justify-between" aria-label="Main">
          <Link to="/">
            <Logo light animated />
          </Link>

          {/* Desktop */}
          <div className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/about" className={linkClass}>
              About Us
            </NavLink>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className={`${linkClass({ isActive: servicesActive })} inline-flex items-center gap-1`}
                aria-expanded={servicesOpen}
                aria-haspopup="true"
                onClick={() => setServicesOpen((o) => !o)}
              >
                Services <ChevronDown className={`h-4 w-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>
              {servicesOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5">
                  {serviceItems.map((s) => (
                    <Link key={s.path} to={s.path} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-accent-200/60">
                      {s.navLabel}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <NavLink to="/contact" className={linkClass}>
              Contact
            </NavLink>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              className="text-sm font-medium text-white/80 hover:text-white"
              onClick={loggedIn ? signOut : () => openLogin('manual')}
              title={loggedIn ? (customer?.label ?? user?.email) : undefined}
            >
              {loggedIn ? 'Sign out' : 'Sign in'}
            </button>
            <PillLink to="/contact" track="navbar">
              Book Appointment
            </PillLink>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="-mr-2 rounded-lg p-2 text-white hover:bg-white/10 md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {mobileOpen && (
          <div className="border-t border-white/10 md:hidden">
            <div className="container-page flex flex-col gap-1 py-3">
              <NavLink to="/" end className={linkClass}>
                Home
              </NavLink>
              <NavLink to="/about" className={linkClass}>
                About Us
              </NavLink>
              <p className="px-3 pt-2 text-xs font-semibold tracking-wide text-white/50 uppercase">Services</p>
              {serviceItems.map((s) => (
                <NavLink key={s.path} to={s.path} className={(p) => `${linkClass(p)} pl-6`}>
                  {s.navLabel}
                </NavLink>
              ))}
              <NavLink to="/contact" className={linkClass}>
                Contact
              </NavLink>
              <div className="mt-3 flex items-center justify-between gap-3">
                <PillLink to="/contact" track="navbar-mobile">
                  Book Appointment
                </PillLink>
                <button
                  type="button"
                  className="text-sm font-medium text-white/80"
                  onClick={loggedIn ? signOut : () => openLogin('manual')}
                >
                  {loggedIn ? 'Sign out' : 'Sign in'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ScrollProgressBar />
    </header>
  )
}
