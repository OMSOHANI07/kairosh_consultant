import { Mail, Smartphone, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { features, site } from '../config/site'
import { snoozeLoginTimer, useLoginTimer } from '../hooks/useLoginTimer'
import { useCustomer } from '../lib/customer'
import { isConfigured } from '../lib/api'

type Method = 'email' | 'phone'
type Step = 'enter' | 'code' | 'done'

function normalisePhone(raw: string) {
  const digits = raw.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return digits
  // Assume India for 10-digit numbers without a country code.
  if (/^\d{10}$/.test(digits)) return `+91${digits}`
  return digits
}

function LoginDialog() {
  const c = useCustomer()
  const [method, setMethod] = useState<Method>('email')
  const [step, setStep] = useState<Step>('enter')
  const [value, setValue] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)

  const dismiss = useCallback(() => {
    if (step !== 'done') snoozeLoginTimer()
    c.closeLogin(step === 'done' ? 'completed' : 'dismissed')
  }, [c, step])

  // Escape to dismiss + keep focus inside the dialog.
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    dialogRef.current?.querySelector<HTMLElement>('input, button')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
      if (e.key !== 'Tab' || !dialogRef.current) return
      const items = dialogRef.current.querySelectorAll<HTMLElement>('button, input, a[href]')
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [dismiss])

  const switchMethod = (m: Method) => {
    setMethod(m)
    setStep('enter')
    setValue('')
    setCode('')
    setError('')
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (!isConfigured) throw new Error('Sign-in is not available yet.')
      if (method === 'email') {
        const email = value.trim().toLowerCase()
        if (step === 'enter') {
          await c.sendEmailCode(email)
          setStep('code')
        } else {
          await c.verifyEmailCode(email, code.trim())
          setStep('done')
        }
      } else {
        const phone = normalisePhone(value)
        if (!/^\+\d{8,15}$/.test(phone)) throw new Error('Please enter a valid mobile number with country code.')
        if (!features.PHONE_OTP_ENABLED) {
          await c.registerPhone(phone)
          setStep('done')
        } else if (step === 'enter') {
          await c.sendPhoneCode(phone)
          setStep('code')
        } else {
          await c.verifyPhoneCode(phone, code.trim())
          setStep('done')
        }
      }
    } catch (err) {
      setError((err as Error).message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const tab = (m: Method, label: string, Icon: typeof Mail) => (
    <button
      type="button"
      role="tab"
      aria-selected={method === m}
      onClick={() => switchMethod(m)}
      className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
        method === m ? 'bg-white text-ink shadow-sm' : 'text-slate-500 hover:text-ink'
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" /> {label}
    </button>
  )

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && dismiss()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="relative w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
      >
        <button type="button" onClick={dismiss} className="btn-ghost absolute top-3 right-3 h-9 w-9 p-0" aria-label="Close">
          <X className="h-5 w-5" />
        </button>

        {step === 'done' ? (
          <div className="py-4 text-center">
            <h2 id="login-title" className="text-xl">You’re signed in 🎉</h2>
            <p className="mt-2 text-sm text-slate-600">Thanks! We’ll use this to personalise your visit and follow up faster.</p>
            <button type="button" className="btn-primary mt-6 w-full" onClick={dismiss}>
              Continue browsing
            </button>
          </div>
        ) : (
          <>
            <h2 id="login-title" className="pr-8 text-xl">Stay in touch with {site.shortName}</h2>
            <p className="mt-1 text-sm text-slate-600">
              Sign in with your email or mobile number to save your interests and get faster replies. It’s optional.
            </p>

            <div className="mt-5 flex gap-1 rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Sign-in method">
              {tab('email', 'Email', Mail)}
              {tab('phone', 'Mobile', Smartphone)}
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4">
              {step === 'enter' ? (
                <div>
                  <label htmlFor="login-value" className="label">
                    {method === 'email' ? 'Email address' : 'Mobile number'}
                  </label>
                  <input
                    id="login-value"
                    className="input"
                    type={method === 'email' ? 'email' : 'tel'}
                    inputMode={method === 'email' ? 'email' : 'tel'}
                    autoComplete={method === 'email' ? 'email' : 'tel'}
                    placeholder={method === 'email' ? 'you@example.com' : '+91 98765 43210'}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="login-code" className="label">
                    Enter the 6-digit code sent to {value}
                  </label>
                  <input
                    id="login-code"
                    className="input tracking-[0.4em]"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d{6}"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                  <button type="button" className="mt-2 text-xs font-medium text-brand-700" onClick={() => setStep('enter')}>
                    Use a different {method === 'email' ? 'email' : 'number'}
                  </button>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="btn-primary w-full" disabled={busy}>
                {busy
                  ? 'Please wait…'
                  : step === 'code'
                    ? 'Verify & sign in'
                    : method === 'phone' && !features.PHONE_OTP_ENABLED
                      ? 'Continue'
                      : 'Send code'}
              </button>
              <button type="button" className="btn-ghost w-full" onClick={dismiss}>
                Maybe later
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

/** Renders the login modal and shows it automatically after 10 min of active time. */
export function LoginModalHost() {
  const { customer, user, ready, loginOpen, openLogin } = useCustomer()
  const { pathname } = useLocation()
  const loggedIn = Boolean(customer || user)
  const onAdmin = pathname.startsWith('/admin')

  useLoginTimer(ready && isConfigured && !loggedIn && !loginOpen && !onAdmin, () => openLogin('timer'))

  return loginOpen && !onAdmin ? <LoginDialog /> : null
}
