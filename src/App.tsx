import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PublicLayout } from './components/Layout'
import { CustomerProvider } from './lib/customer'
import About from './pages/About'
import Contact from './pages/Contact'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Privacy from './pages/Privacy'
import ServicePage from './pages/ServicePage'

// The admin dashboard (and its chart library) is a separate chunk that public visitors never download.
const AdminApp = lazy(() => import('./admin/AdminApp'))

export default function App() {
  return (
    <BrowserRouter>
      <CustomerProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services/website" element={<ServicePage category="website" />} />
            <Route path="services/ai" element={<ServicePage category="ai" />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route
            path="admin/*"
            element={
              <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading dashboard…</div>}>
                <AdminApp />
              </Suspense>
            }
          />
        </Routes>
      </CustomerProvider>
    </BrowserRouter>
  )
}
