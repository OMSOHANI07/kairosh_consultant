import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { getConsent, initTracking, trackPageView } from '../lib/tracking'
import { ConsentBanner } from './ConsentBanner'
import { Footer } from './Footer'
import { LoginModalHost } from './LoginModal'
import { Navbar } from './Navbar'

export function PublicLayout() {
  const { pathname, hash } = useLocation()
  const [showConsent, setShowConsent] = useState(() => getConsent() === null)

  useEffect(() => {
    initTracking()
  }, [])

  // Page view per route. setTimeout lets the page set its <title> first.
  useEffect(() => {
    const id = window.setTimeout(() => trackPageView(pathname, document.title), 0)
    if (!hash) window.scrollTo({ top: 0 })
    return () => window.clearTimeout(id)
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer onCookieSettings={() => setShowConsent(true)} />
      {showConsent && <ConsentBanner onChoice={() => setShowConsent(false)} />}
      <LoginModalHost />
    </div>
  )
}
