// Animated "AI workflow" illustration: a pulsing AI core connected to the
// tools it automates, with data flowing along the connections.
// Pure CSS/SVG, scales with its container (cqw units).
import { Bot, CalendarCheck, ChartColumn, CheckCircle2, FileText, Mail, MessageSquare, type LucideIcon } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'

type Node = { x: number; y: number; label: string; sub: string; Icon: LucideIcon; dark?: boolean }

// Positions in % of the 500 x 400 canvas.
const nodes: Node[] = [
  { x: 17, y: 16, label: 'New lead', sub: 'Website form', Icon: Mail },
  { x: 83, y: 16, label: 'Auto-reply', sub: 'WhatsApp & email', Icon: MessageSquare, dark: true },
  { x: 12, y: 70, label: 'Invoice read', sub: 'Data extracted', Icon: FileText, dark: true },
  { x: 88, y: 70, label: 'Report sent', sub: 'Every Monday', Icon: ChartColumn },
  { x: 50, y: 93, label: 'Meeting booked', sub: 'Calendar synced', Icon: CalendarCheck },
]

const CX = 250
const CY = 190
const d = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` })

export function AiIllustration({ className = '' }: { className?: string }) {
  // SMIL animations are not covered by the CSS reduced-motion rule, so check it here.
  const [motion, setMotion] = useState(false)
  useEffect(() => {
    setMotion(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  return (
    <div className={`@container relative aspect-[5/4] w-full select-none ${className}`} aria-hidden="true">
      <div className="absolute top-1/2 left-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-400/25 blur-3xl" />

      {/* Connections */}
      <svg viewBox="0 0 500 400" className="absolute inset-0 h-full w-full overflow-visible">
        {nodes.map((n, i) => {
          const x = n.x * 5
          const y = n.y * 4
          const path = `M${CX},${CY} Q${(CX + x) / 2 + (i % 2 ? 30 : -30)},${(CY + y) / 2} ${x},${y}`
          return (
            <g key={n.label}>
              <path d={path} fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-400/30" />
              <path d={path} fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 14" strokeLinecap="round" className="animate-dash text-accent-400" />
              {motion && (
                <circle r="5" className="fill-accent-300">
                  <animateMotion dur={`${2.4 + i * 0.35}s`} repeatCount="indefinite" path={path} keyPoints={i % 2 ? '1;0' : '0;1'} keyTimes="0;1" calcMode="linear" />
                </circle>
              )}
            </g>
          )
        })}
      </svg>

      {/* AI core */}
      <div className="absolute top-[47.5%] left-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="animate-pulse-ring absolute inset-0 rounded-full bg-accent-400" />
        <span className="animate-pulse-ring absolute inset-0 rounded-full bg-accent-400" style={d(1300)} />
        <span className="animate-spin-slow absolute -inset-[3.5cqw] rounded-full border-2 border-dashed border-accent-400/60" />
        <div className="relative flex h-[22cqw] w-[22cqw] flex-col items-center justify-center rounded-full bg-gradient-to-br from-accent-300 to-accent-500 text-ink shadow-[0_0_60px_-10px] shadow-accent-400">
          <Bot className="h-[9cqw] w-[9cqw]" strokeWidth={1.6} />
          <span className="text-[2.6cqw] font-extrabold tracking-wide uppercase">AI Agent</span>
        </div>
      </div>

      {/* Tool nodes */}
      {nodes.map((n, i) => (
        <div key={n.label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
          <div
            className={`animate-float flex items-center gap-[1.6cqw] rounded-[2.4cqw] px-[2.2cqw] py-[1.6cqw] whitespace-nowrap shadow-xl ${
              n.dark ? 'bg-brand-900 ring-1 ring-white/10' : 'bg-white'
            }`}
            style={d(i * 450)}
          >
            <span
              className={`flex h-[6.4cqw] w-[6.4cqw] items-center justify-center rounded-full ${
                n.dark ? 'bg-accent-400 text-ink' : 'bg-brand-900 text-accent-400'
              }`}
            >
              <n.Icon className="h-[3.4cqw] w-[3.4cqw]" />
            </span>
            <span className="leading-tight">
              <span className={`block text-[2.7cqw] font-bold ${n.dark ? 'text-white' : 'text-ink'}`}>{n.label}</span>
              <span className={`block text-[2cqw] ${n.dark ? 'text-brand-200' : 'text-slate-500'}`}>{n.sub}</span>
            </span>
          </div>
        </div>
      ))}

      {/* Completion toast */}
      <div className="absolute top-[22%] left-1/2 -translate-x-1/2">
        <div className="animate-toast flex items-center gap-[1.2cqw] rounded-full bg-white px-[2.6cqw] py-[1.2cqw] text-[2.4cqw] font-semibold whitespace-nowrap text-ink shadow-lg" style={d(800)}>
          <CheckCircle2 className="h-[3.2cqw] w-[3.2cqw] text-accent-600" /> Task automated
        </div>
      </div>
    </div>
  )
}
