// Counts cumulative ACTIVE time on the site (tab visible) across page changes
// and refreshes, and fires `onDue` every LOGIN_POPUP_INTERVAL_MINUTES.
import { useEffect, useRef } from 'react'
import { features } from '../config/site'
import { getItem, keys, setItem } from '../lib/storage'

type TimerState = { activeMs: number; nextAt: number }

const INTERVAL_MS = features.LOGIN_POPUP_INTERVAL_MINUTES * 60_000
const TICK_MS = 1000

function read(): TimerState {
  return getItem<TimerState>(keys.loginTimer) ?? { activeMs: 0, nextAt: INTERVAL_MS }
}

/** Schedule the next prompt INTERVAL_MS of active time from now (call after a dismissal). */
export function snoozeLoginTimer() {
  const s = read()
  setItem(keys.loginTimer, { activeMs: s.activeMs, nextAt: s.activeMs + INTERVAL_MS })
}

/**
 * @param enabled false while the visitor is logged in or the popup is open:
 *                the timer is paused.
 */
export function useLoginTimer(enabled: boolean, onDue: () => void) {
  const onDueRef = useRef(onDue)
  useEffect(() => {
    onDueRef.current = onDue
  }, [onDue])

  useEffect(() => {
    if (!enabled) return
    let last = Date.now()

    const tick = () => {
      const now = Date.now()
      // Cap each step so a suspended laptop or throttled tab doesn't count as active time.
      const delta = Math.min(now - last, TICK_MS * 5)
      last = now
      if (document.visibilityState !== 'visible') return

      const s = read()
      s.activeMs += delta
      setItem(keys.loginTimer, s)
      if (s.activeMs >= s.nextAt) onDueRef.current()
    }

    const onVisibility = () => {
      last = Date.now() // don't count hidden time
    }

    const id = window.setInterval(tick, TICK_MS)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [enabled])
}
