import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'

export default function NotFound() {
  usePageMeta({ title: 'Page not found', noindex: true })
  return (
    <section className="container-page py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl">Page not found</h1>
      <p className="mt-3 text-slate-600">The page you’re looking for doesn’t exist or has moved.</p>
      <Link to="/" className="btn-primary mt-8">
        Back to home
      </Link>
    </section>
  )
}
