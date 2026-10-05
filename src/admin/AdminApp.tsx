import { BarChart3, FolderKanban, Inbox, LogOut, MessageSquareQuote, Users } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { usePageMeta } from '../hooks/usePageMeta'
import { useCustomer } from '../lib/customer'
import { isConfigured } from '../lib/api'
import { auth, db } from '../lib/neon'
import ContentManager from './ContentManager'
import Journey from './Journey'
import Leads from './Leads'
import Overview from './Overview'
import Visitors from './Visitors'

type Gate = 'loading' | 'signed-out' | 'not-admin' | 'admin'

function AdminLogin({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (step === 'email') {
        const { error } = await auth.emailOtp.sendVerificationOtp({ email: email.trim(), type: 'sign-in' })
        if (error) throw new Error(error.message || 'Could not send code')
        setStep('code')
      } else {
        const { error } = await auth.signIn.emailOtp({ email: email.trim(), otp: code.trim() })
        if (error) throw new Error(error.message || 'Invalid code')
        onSignedIn()
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-8">
        <Logo />
        <h1 className="text-xl">Admin sign in</h1>
        {step === 'email' ? (
          <div>
            <label htmlFor="admin-email" className="label">Admin email</label>
            <input id="admin-email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        ) : (
          <div>
            <label htmlFor="admin-code" className="label">6-digit code sent to {email}</label>
            <input id="admin-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required className="input tracking-[0.4em]" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
          </div>
        )}
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Please wait…' : step === 'email' ? 'Send code' : 'Sign in'}
        </button>
        <Link to="/" className="block text-center text-sm text-slate-500 hover:text-ink">← Back to website</Link>
      </form>
    </div>
  )
}

const nav = [
  { to: '/admin', label: 'Overview', Icon: BarChart3, end: true },
  { to: '/admin/visitors', label: 'Visitors', Icon: Users },
  { to: '/admin/portfolio', label: 'Portfolio', Icon: FolderKanban },
  { to: '/admin/testimonials', label: 'Testimonials', Icon: MessageSquareQuote },
  { to: '/admin/leads', label: 'Leads', Icon: Inbox },
]

export default function AdminApp() {
  usePageMeta({ title: 'Admin', noindex: true })
  const { refreshUser, signOut, user } = useCustomer()
  const [gate, setGate] = useState<Gate>('loading')

  const check = useCallback(async () => {
    setGate('loading')
    const u = await refreshUser()
    if (!u) return setGate('signed-out')
    // The real protection is RLS in the database; this only decides what to render.
    const { data, error } = await db.rpc('is_admin')
    setGate(!error && data === true ? 'admin' : 'not-admin')
  }, [refreshUser])

  useEffect(() => {
    check()
  }, [check])

  if (!isConfigured) return <p className="p-8">Set VITE_NEON_URL to use the dashboard.</p>
  if (gate === 'loading') return <p className="p-8 text-sm text-slate-500">Checking access…</p>
  if (gate === 'signed-out') return <AdminLogin onSignedIn={check} />
  if (gate === 'not-admin') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="card max-w-md p-8 text-center">
          <h1 className="text-xl">No admin access</h1>
          <p className="mt-2 text-sm text-slate-600">
            {user?.email} is not in the <code>admins</code> table. Add it in the Neon SQL editor, then sign in again.
          </p>
          <button type="button" className="btn-secondary mt-6" onClick={() => signOut().then(check)}>
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between p-4 lg:block">
          <Link to="/admin"><Logo /></Link>
          <button type="button" onClick={() => signOut().then(check)} className="btn-ghost px-2 lg:hidden" aria-label="Sign out">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 lg:flex-col lg:px-3" aria-label="Admin">
          {nav.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden p-3 lg:absolute lg:bottom-0 lg:block lg:w-full">
          <p className="truncate px-3 text-xs text-slate-500">{user?.email}</p>
          <button type="button" onClick={() => signOut().then(check)} className="btn-ghost mt-1 w-full justify-start">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="visitors" element={<Visitors />} />
          <Route path="visitors/:visitorId" element={<Journey />} />
          <Route path="portfolio" element={<ContentManager kind="portfolio" />} />
          <Route path="testimonials" element={<ContentManager kind="testimonials" />} />
          <Route path="leads" element={<Leads />} />
        </Routes>
      </main>
    </div>
  )
}
