import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'

/** Fades and slides its children up when they scroll into view (once). */
export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  variant = 'up',
  className = '',
}: {
  children: ReactNode
  delay?: number
  as?: ElementType
  /** Direction the element animates in from. */
  variant?: 'up' | 'left' | 'right' | 'zoom'
  className?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) return setVisible(true)
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`reveal ${variant !== 'up' ? `reveal-${variant}` : ''} ${visible ? 'is-visible' : ''} ${className}`}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  )
}
