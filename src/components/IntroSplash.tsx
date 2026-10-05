// Plays the animated Kairosh logo once per browser session, then fades out to
// reveal the site. Whether it plays is decided before React renders, by the
// inline script in index.html (sets <html data-intro="on">): not on /admin,
// not for crawlers, and never for visitors who prefer reduced motion.
// Clicking or pressing any key skips it.
import { useEffect, useState } from 'react'
import { KairoshMark } from './KairoshMark'

const SHOW_MS = 2900 // the logo has finished building by now
const FADE_MS = 500

function finish() {
  try {
    sessionStorage.setItem('kc_intro', '1')
  } catch {
    /* storage unavailable */
  }
  delete document.documentElement.dataset.intro
}

export function IntroSplash() {
  const [phase, setPhase] = useState<'off' | 'play' | 'fade'>(() =>
    document.documentElement.dataset.intro === 'on' ? 'play' : 'off',
  )

  useEffect(() => {
    if (phase === 'play') {
      const id = window.setTimeout(() => setPhase('fade'), SHOW_MS)
      const skip = () => setPhase('fade')
      window.addEventListener('keydown', skip, { once: true })
      return () => {
        window.clearTimeout(id)
        window.removeEventListener('keydown', skip)
      }
    }
    if (phase === 'fade') {
      finish()
      const id = window.setTimeout(() => setPhase('off'), FADE_MS)
      return () => window.clearTimeout(id)
    }
  }, [phase])

  if (phase === 'off') return null

  return (
    <div
      aria-hidden="true"
      onClick={() => setPhase('fade')}
      className={`fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-brand-950 transition-opacity duration-500 ${
        phase === 'fade' ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-400/10 blur-3xl" />
      <div className="km-animated relative flex flex-col items-center gap-6 px-6 text-center">
        <KairoshMark size={170} tone="light" animated duration={3.6} />
        <div className="flex flex-col items-center gap-3">
          <span className="km-name text-5xl font-bold tracking-tight text-white sm:text-6xl">Kairosh</span>
          <span className="km-sub text-xs font-semibold tracking-[0.6em] text-brand-200 uppercase sm:text-sm">Consultants</span>
          <span className="km-tag mt-2 text-xs tracking-wide text-brand-200 sm:text-sm">Websites · AI Automation · The right moment</span>
        </div>
      </div>
      <span className="absolute bottom-6 text-[11px] tracking-widest text-white/70 uppercase">Click to skip</span>
    </div>
  )
}
