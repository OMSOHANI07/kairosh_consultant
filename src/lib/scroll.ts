// One passive scroll/resize listener, batched with requestAnimationFrame,
// shared by every scroll-linked animation on the page.
import { useEffect, type RefObject } from 'react'

const subscribers = new Set<() => void>()
let ticking = false

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    ticking = false
    subscribers.forEach((fn) => fn())
  })
}

export function subscribeScroll(fn: () => void) {
  if (!subscribers.size) {
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
  }
  subscribers.add(fn)
  fn()
  return () => {
    subscribers.delete(fn)
    if (!subscribers.size) {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const clamp = (n: number) => Math.min(1, Math.max(0, n))

/**
 * Writes the element's scroll progress to the CSS variable `--p` (0 → 1):
 *  - 'through': 0 when the element's top enters the bottom of the viewport,
 *               1 when its bottom leaves the top.
 *  - 'exit':    0 while the element's top is at the top of the viewport,
 *               1 once it has scrolled fully out (for heroes).
 * Styles read it, e.g. transform: translateY(calc(var(--p) * 80px)).
 * Does nothing when the visitor prefers reduced motion.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, mode: 'through' | 'exit' = 'through') {
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    return subscribeScroll(() => {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      if (r.bottom < -vh || r.top > vh * 2) return // far off-screen: skip work
      const p = mode === 'exit' ? clamp(-r.top / r.height) : clamp((vh - r.top) / (vh + r.height))
      el.style.setProperty('--p', p.toFixed(4))
    })
  }, [ref, mode])
}
