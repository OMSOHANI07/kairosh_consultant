// Animated "website being built" illustration: a tilted browser window whose
// layout assembles itself, a floating phone preview, a clicking cursor and
// floating badges. Pure CSS/HTML, scales with its container (cqw units).
import { CodeXml, Gauge, MousePointer2, Search, TrendingUp } from 'lucide-react'
import type { CSSProperties } from 'react'

const d = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` })

export function WebsiteIllustration({ className = '' }: { className?: string }) {
  return (
    <div className={`@container relative aspect-[5/4] w-full select-none ${className}`} aria-hidden="true">
      {/* Glow */}
      <div className="absolute top-[12%] left-[12%] h-[60%] w-[60%] rounded-full bg-accent-400/25 blur-3xl" />

      {/* Browser window */}
      <div className="animate-float-slow absolute top-[8%] left-[3%] w-[80%] [perspective:1200px]">
        <div className="overflow-hidden rounded-[3cqw] bg-white shadow-2xl ring-1 ring-black/5 [transform:rotateY(-14deg)_rotateX(6deg)]">
          <div className="flex items-center gap-[1.2cqw] bg-brand-900 px-[3cqw] py-[2cqw]">
            <span className="h-[1.8cqw] w-[1.8cqw] rounded-full bg-red-400" />
            <span className="h-[1.8cqw] w-[1.8cqw] rounded-full bg-amber-300" />
            <span className="h-[1.8cqw] w-[1.8cqw] rounded-full bg-accent-400" />
            <span className="ml-[2cqw] flex-1 truncate rounded-full bg-white/10 px-[2cqw] py-[0.6cqw] text-[2.2cqw] text-white/70">
              yourbusiness.com
            </span>
          </div>

          <div className="space-y-[3cqw] p-[3.5cqw]">
            {/* Nav */}
            <div className="flex items-center justify-between">
              <span className="h-[2.4cqw] w-[11cqw] rounded-full bg-brand-900" />
              <div className="flex gap-[2cqw]">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-[1.6cqw] w-[6cqw] rounded-full bg-slate-200" />
                ))}
              </div>
              <span className="animate-build h-[3.4cqw] w-[11cqw] rounded-full bg-accent-400" style={d(900)} />
            </div>

            {/* Hero */}
            <div className="grid grid-cols-5 items-center gap-[3cqw]">
              <div className="col-span-3 space-y-[1.8cqw]">
                <span className="animate-grow-x block h-[3cqw] w-full rounded-full bg-brand-900" style={d(0)} />
                <span className="animate-grow-x block h-[3cqw] w-4/5 rounded-full bg-brand-900" style={d(250)} />
                <span className="animate-grow-x block h-[1.6cqw] w-full rounded-full bg-slate-200" style={d(500)} />
                <span className="animate-grow-x block h-[1.6cqw] w-3/4 rounded-full bg-slate-200" style={d(650)} />
                <span className="animate-build relative mt-[1cqw] block h-[4.4cqw] w-[18cqw] rounded-full bg-accent-400" style={d(1100)} />
              </div>
              <div className="animate-build col-span-2 aspect-square rounded-[2.5cqw] bg-gradient-to-br from-brand-700 to-brand-950 p-[2cqw]" style={d(700)}>
                <div className="flex h-full items-end gap-[1.2cqw]">
                  {[45, 70, 55, 90].map((h, i) => (
                    <span key={i} className="flex-1 rounded-t-[1cqw] bg-accent-400" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-3 gap-[2.5cqw]">
              {[1400, 1650, 1900].map((ms, i) => (
                <div key={ms} className="animate-build space-y-[1.4cqw] rounded-[2cqw] bg-cream p-[2.4cqw]" style={d(ms)}>
                  <span className={`block h-[4cqw] w-[4cqw] rounded-[1.2cqw] ${i === 1 ? 'bg-accent-400' : 'bg-brand-900'}`} />
                  <span className="block h-[1.4cqw] w-full rounded-full bg-slate-300" />
                  <span className="block h-[1.4cqw] w-2/3 rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cursor clicking the hero button */}
        <div className="absolute top-[55%] left-[22%]">
          <span className="animate-click absolute -top-[2cqw] -left-[2cqw] h-[6cqw] w-[6cqw] rounded-full border-2 border-accent-500" />
          <MousePointer2 className="animate-cursor h-[6cqw] w-[6cqw] fill-brand-950 text-white drop-shadow-lg" />
        </div>
      </div>

      {/* Phone preview */}
      <div className="animate-float-tilt absolute right-[3%] bottom-[4%] w-[24%]" style={d(600)}>
        <div className="rounded-[4cqw] bg-brand-950 p-[1.3cqw] shadow-2xl">
          <div className="aspect-[9/17] space-y-[1.6cqw] rounded-[3cqw] bg-white p-[2cqw]">
            <span className="mx-auto block h-[1cqw] w-[7cqw] rounded-full bg-slate-200" />
            <span className="animate-build block aspect-[4/3] w-full rounded-[1.6cqw] bg-gradient-to-br from-brand-700 to-brand-950" style={d(1200)} />
            <span className="animate-grow-x block h-[1.6cqw] w-full rounded-full bg-brand-900" style={d(1300)} />
            <span className="animate-grow-x block h-[1.2cqw] w-3/4 rounded-full bg-slate-200" style={d(1450)} />
            <span className="animate-build block h-[3cqw] w-full rounded-full bg-accent-400" style={d(1600)} />
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="animate-float absolute top-[2%] right-[6%] flex items-center gap-[1.6cqw] rounded-[2.4cqw] bg-white px-[2.4cqw] py-[1.8cqw] shadow-xl" style={d(300)}>
        <span className="flex h-[6cqw] w-[6cqw] items-center justify-center rounded-full bg-accent-400 text-ink">
          <Gauge className="h-[3.4cqw] w-[3.4cqw]" />
        </span>
        <span className="leading-tight">
          <span className="block text-[3.4cqw] font-extrabold text-ink">100</span>
          <span className="block text-[2cqw] text-slate-500">Performance</span>
        </span>
      </div>

      <div className="animate-float absolute bottom-[8%] left-[2%] flex items-center gap-[1.6cqw] rounded-[2.4cqw] bg-white px-[2.4cqw] py-[1.8cqw] shadow-xl" style={d(1500)}>
        <span className="flex h-[6cqw] w-[6cqw] items-center justify-center rounded-full bg-brand-900 text-accent-400">
          <Search className="h-[3.2cqw] w-[3.2cqw]" />
        </span>
        <span className="leading-tight">
          <span className="flex items-center gap-[0.8cqw] text-[2.8cqw] font-bold text-ink">
            SEO <TrendingUp className="h-[3cqw] w-[3cqw] text-accent-600" />
          </span>
          <span className="block text-[2cqw] text-slate-500">Ranking higher</span>
        </span>
      </div>

      <div className="animate-float-slow absolute top-[40%] -left-[1%] flex h-[9cqw] w-[9cqw] items-center justify-center rounded-[2.6cqw] bg-brand-900 text-accent-400 shadow-xl" style={d(800)}>
        <CodeXml className="h-[4.6cqw] w-[4.6cqw]" />
      </div>
    </div>
  )
}
