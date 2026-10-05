// The Kairosh logo mark (from the "Kairosh Consultants Logo" design):
// a ring with a "moment" tick, a K whose arms meet at an orange dot.
// `animated` plays the build-up animation (ring draws, tick pops, stem draws,
// arms swing in, dot pulses). Change `replayKey` to play it again.

const ORANGE = '#FF6B2C'

export function KairoshMark({
  size = 32,
  tone = 'light',
  accent,
  animated = false,
  duration = 2.4,
  replayKey = 0,
  className = '',
  title,
}: {
  size?: number
  /** 'light' = white strokes (for dark backgrounds), 'dark' = ink strokes (for light backgrounds). */
  tone?: 'light' | 'dark'
  /** Colour of the upper arm. Defaults to the site's lime on dark, deep green on light. */
  accent?: string
  animated?: boolean
  /** Length of the build-up animation in seconds. */
  duration?: number
  replayKey?: number
  className?: string
  /** Accessible name; omit when the mark sits next to visible brand text. */
  title?: string
}) {
  const stroke = tone === 'light' ? '#FFFFFF' : '#0E2A24'
  const arm = accent ?? (tone === 'light' ? '#B7F06E' : '#1F5C4E')
  const a = (cls: string) => (animated ? cls : undefined)

  return (
    <svg
      key={replayKey}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={`${animated ? 'km-animated' : ''} ${className}`}
      style={animated ? ({ '--km-d': `${duration}s` } as React.CSSProperties) : undefined}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <circle className={a('km-ring')} cx="32" cy="32" r="26" stroke={stroke} strokeWidth="4.5" transform="rotate(-90 32 32)" />
      <path className={a('km-tick')} d="M32 6 V11" stroke={ORANGE} strokeWidth="4.5" strokeLinecap="round" />
      <path className={a('km-stem')} d="M24 19 V45" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
      <path className={a('km-arm1')} d="M25 32 L39 21" stroke={arm} strokeWidth="6" strokeLinecap="round" />
      <path className={a('km-arm2')} d="M25 32 L40 43" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
      {animated && <circle className="km-pulse" cx="25" cy="32" r="4" stroke={ORANGE} strokeWidth="1.2" />}
      <circle className={a('km-dot')} cx="25" cy="32" r="4" fill={ORANGE} />
    </svg>
  )
}
