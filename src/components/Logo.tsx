import { useEffect, useState } from 'react'
import { site } from '../config/site'
import { KairoshMark } from './KairoshMark'

/**
 * Logo mark + two-line wordmark ("Kairosh" / "CONSULTANTS").
 * `animated`: the mark draws itself when it first appears and replays on hover.
 */
export function Logo({
  className = '',
  light = false,
  animated = false,
}: {
  className?: string
  light?: boolean
  animated?: boolean
}) {
  const [replay, setReplay] = useState(0)
  const introOn = typeof document !== 'undefined' && document.documentElement.dataset.intro === 'on'
  const [ready, setReady] = useState(!animated || !introOn)

  // While the intro splash plays, wait and draw the mark in as the splash fades out.
  useEffect(() => {
    if (ready) return
    const id = window.setTimeout(() => setReady(true), 2900)
    return () => window.clearTimeout(id)
  }, [ready])

  return (
    <span
      className={`inline-flex items-center gap-2.5 ${className}`}
      onMouseEnter={animated ? () => setReplay((n) => n + 1) : undefined}
    >
      <KairoshMark size={36} tone={light ? 'light' : 'dark'} animated={animated && ready} replayKey={replay} />
      <span className="flex flex-col leading-none">
        <span className={`text-xl font-bold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>{site.shortName}</span>
        <span className={`mt-1 text-[9px] font-semibold tracking-[0.32em] uppercase ${light ? 'text-brand-200' : 'text-slate-500'}`}>
          Consultants
        </span>
      </span>
      <span className="sr-only">{site.name}</span>
    </span>
  )
}
