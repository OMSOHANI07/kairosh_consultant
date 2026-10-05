// Scroll-linked effects: page progress bar, scroll-down cue, skills marquee
// and count-up numbers.
import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion, subscribeScroll, useScrollProgress } from '../lib/scroll'

/** Thin lime bar along the bottom edge of the sticky header that fills as the page is scrolled. */
export function ScrollProgressBar() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    return subscribeScroll(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      el.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`
    })
  }, [])
  return (
    <div className="pointer-events-none absolute inset-x-0 -bottom-[3px] z-10 h-[3px]" aria-hidden="true">
      <div ref={ref} className="h-full origin-left bg-accent-400 shadow-[0_0_12px] shadow-accent-400/70" style={{ transform: 'scaleX(0)' }} />
    </div>
  )
}

/** Bouncing "Scroll" cue that jumps to the element with the given id. */
export function ScrollCue({ target }: { target: string }) {
  return (
    <a
      href={`#${target}`}
      onClick={(e) => {
        e.preventDefault()
        document.getElementById(target)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
      }}
      className="group absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-medium tracking-[0.2em] text-white/70 uppercase hover:text-white md:flex"
    >
      Scroll
      <span className="flex h-10 w-6 justify-center rounded-full border-2 border-white/40 pt-2 group-hover:border-accent-400">
        <span className="animate-scroll-dot h-2 w-1 rounded-full bg-accent-400" />
      </span>
      <ChevronDown className="animate-bounce h-4 w-4 text-accent-400" aria-hidden="true" />
      <span className="sr-only">to the next section</span>
    </a>
  )
}

/** Two bands of words that slide sideways in opposite directions while scrolling. */
export function ScrollMarquee({ items }: { items: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useScrollProgress(ref)
  const row = [...items, ...items, ...items]

  const Band = ({ dir, dark }: { dir: 1 | -1; dark?: boolean }) => (
    <div
      className={`flex w-max gap-8 py-4 text-2xl font-extrabold tracking-tight whitespace-nowrap uppercase sm:text-4xl ${
        dark ? 'bg-brand-950 text-white' : 'bg-accent-400 text-ink'
      }`}
      style={{ transform: `translateX(calc(${dir === 1 ? '-35%' : '-5%'} + var(--p, 0.5) * ${dir * 30}%))` }}
    >
      {row.map((t, i) => (
        <span key={i} className="flex items-center gap-8">
          {t}
          <span className={dark ? 'text-accent-400' : 'text-brand-900'} aria-hidden="true">
            ✱
          </span>
        </span>
      ))}
    </div>
  )

  return (
    <div ref={ref} className="relative overflow-hidden py-6" aria-label={items.join(', ')} role="img">
      <div className="-rotate-2">
        <Band dir={1} />
      </div>
      <div className="-mt-2 rotate-1">
        <Band dir={-1} dark />
      </div>
    </div>
  )
}

/** Counts up from 0 to `value` the first time it scrolls into view. */
export function CountUp({ value, decimals = 0, suffix = '' }: { value: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return setStarted(true)
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setStarted(true)
        io.disconnect()
      }
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    if (prefersReducedMotion()) return setShown(value)
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1400)
      setShown(value * (1 - Math.pow(1 - t, 3))) // ease-out
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started, value])

  return (
    <span ref={ref} className="tabular-nums">
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  )
}
