import { ChevronDown, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { services } from '../content/services'
import { useCustomer } from '../lib/customer'
import { CtaLink } from './CtaLink'
import { Logo } from './Logo'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'text-brand-700' : 'text-slate-600 hover:text-ink'
  }`

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
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <nav className="container-page flex h-16 items-center justify-between" aria-label="Main">
        <Link to="/">
          <Logo />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            About
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
              <div className="card absolute left-0 mt-2 w-64 p-2">
                {serviceItems.map((s) => (
                  <Link
                    key={s.path}
                    to={s.path}
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-50"
                  >
                    <span className="font-medium text-ink">{s.navLabel}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <NavLink to="/contact" className={linkClass}>
            Contact
          </NavLink>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {loggedIn ? (
            <button type="button" className="btn-ghost" onClick={signOut} title={customer?.label ?? user?.email}>
              Sign out
            </button>
          ) : (
            <button type="button" className="btn-ghost" onClick={() => openLogin('manual')}>
              Sign in
            </button>
          )}
          <CtaLink to="/contact" label="Book a Free Consultation" location="navbar">
            Free Consultation
          </CtaLink>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="btn-ghost -mr-2 px-2 md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/about" className={linkClass}>
              About
            </NavLink>
            <p className="px-3 pt-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Services</p>
            {serviceItems.map((s) => (
              <NavLink key={s.path} to={s.path} className={(p) => `${linkClass(p)} pl-6`}>
                {s.navLabel}
              </NavLink>
            ))}
            <NavLink to="/contact" className={linkClass}>
              Contact
            </NavLink>
            <div className="mt-2 flex gap-2">
              <CtaLink to="/contact" label="Book a Free Consultation" location="navbar-mobile" className="btn-primary flex-1">
                Book a Free Consultation
              </CtaLink>
              {loggedIn ? (
                <button type="button" className="btn-secondary" onClick={signOut}>
                  Sign out
                </button>
              ) : (
                <button type="button" className="btn-secondary" onClick={() => openLogin('manual')}>
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
