import { Link } from 'react-router-dom'
import { setConsent, type Consent } from '../lib/tracking'

/** DPDP Act notice: detailed analytics only start after the visitor accepts. */
export function ConsentBanner({ onChoice }: { onChoice: (c: Consent) => void }) {
  const choose = (c: Consent) => {
    setConsent(c)
    onChoice(c)
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
    >
      <div className="card mx-auto flex max-w-3xl flex-col gap-3 p-4 shadow-lg sm:flex-row sm:items-center sm:gap-6">
        <p className="text-sm text-slate-600">
          We use local storage and cookies to understand how visitors use this site (pages viewed, time spent,
          device and approximate location) so we can improve it. We never sell your data.{' '}
          <Link to="/privacy" className="font-medium text-brand-700 underline">
            Privacy Policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" className="btn-secondary" onClick={() => choose('declined')}>
            Decline
          </button>
          <button type="button" className="btn-primary" onClick={() => choose('accepted')}>
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
