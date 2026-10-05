import { CheckCircle2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { site } from '../config/site'
import { insert, isConfigured } from '../lib/api'
import { getVisitorId, track } from '../lib/tracking'

export function ContactForm({ source }: { source: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    // Honeypot: real people never fill this hidden field.
    if (form.get('company_website')) {
      setStatus('sent')
      return
    }
    const lead = {
      name: String(form.get('name') ?? '').trim(),
      email: String(form.get('email') ?? '').trim(),
      phone: String(form.get('phone') ?? '').trim() || null,
      message: String(form.get('message') ?? '').trim(),
      visitor_id: getVisitorId(),
    }
    if (!isConfigured) {
      setStatus('error')
      setError(`The form is not connected yet. Please email us at ${site.email}.`)
      return
    }
    setStatus('sending')
    setError('')
    const { error } = await insert('leads', lead)
    if (error) {
      setStatus('error')
      setError(`Something went wrong. Please try again or email ${site.email}.`)
      return
    }
    track('contact_submit', { source })
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div className="card flex flex-col items-center p-8 text-center" role="status">
        <CheckCircle2 className="h-12 w-12 text-brand-600" aria-hidden="true" />
        <h3 className="mt-3 text-xl">Thanks, we’ve got your message!</h3>
        <p className="mt-1 text-slate-600">We usually reply within one business day.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="card grid gap-4 p-6 sm:grid-cols-2 sm:p-8" noValidate={false}>
      <div>
        <label htmlFor={`${source}-name`} className="label">Name</label>
        <input id={`${source}-name`} name="name" required maxLength={200} autoComplete="name" className="input" />
      </div>
      <div>
        <label htmlFor={`${source}-email`} className="label">Email</label>
        <input id={`${source}-email`} name="email" type="email" required maxLength={320} autoComplete="email" className="input" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${source}-phone`} className="label">
          Phone <span className="font-normal text-slate-500">(optional)</span>
        </label>
        <input id={`${source}-phone`} name="phone" type="tel" maxLength={30} autoComplete="tel" className="input" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${source}-message`} className="label">How can we help?</label>
        <textarea id={`${source}-message`} name="message" required rows={5} maxLength={5000} className="input" />
      </div>
      <div className="hidden" aria-hidden="true">
        <label>
          Leave this empty <input name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          By sending this form you agree to our <Link to="/privacy" className="underline">Privacy Policy</Link>.
        </p>
        <button type="submit" className="btn-primary" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-sm text-red-600 sm:col-span-2" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
