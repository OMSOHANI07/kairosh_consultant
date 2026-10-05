import { useMemo, useState } from 'react'

export type RangeKey = 'today' | '7d' | '30d' | 'custom'
export type DateRange = { from: Date; to: Date }

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const toInput = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function useDateRange(initial: RangeKey = '30d') {
  const [key, setKey] = useState<RangeKey>(initial)
  const [custom, setCustom] = useState(() => ({ from: toInput(addDays(new Date(), -30)), to: toInput(new Date()) }))

  const range = useMemo<DateRange>(() => {
    const today = startOfDay(new Date())
    const tomorrow = addDays(today, 1)
    if (key === 'today') return { from: today, to: tomorrow }
    if (key === '7d') return { from: addDays(today, -6), to: tomorrow }
    if (key === '30d') return { from: addDays(today, -29), to: tomorrow }
    const [fy, fm, fd] = custom.from.split('-').map(Number)
    const [ty, tm, td] = custom.to.split('-').map(Number)
    return { from: new Date(fy, fm - 1, fd), to: addDays(new Date(ty, tm - 1, td), 1) }
  }, [key, custom])

  return { key, setKey, custom, setCustom, range }
}

export function DateRangePicker({ state }: { state: ReturnType<typeof useDateRange> }) {
  const options: [RangeKey, string][] = [
    ['today', 'Today'],
    ['7d', '7 days'],
    ['30d', '30 days'],
    ['custom', 'Custom'],
  ]
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-lg border border-slate-200 bg-white p-0.5" role="group" aria-label="Date range">
        {options.map(([k, label]) => (
          <button
            key={k}
            type="button"
            aria-pressed={state.key === k}
            onClick={() => state.setKey(k)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${state.key === k ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {state.key === 'custom' && (
        <div className="flex items-center gap-2 text-sm">
          <label className="sr-only" htmlFor="range-from">From</label>
          <input id="range-from" type="date" className="input w-auto py-1.5" value={state.custom.from} max={state.custom.to}
            onChange={(e) => state.setCustom((c) => ({ ...c, from: e.target.value }))} />
          <span aria-hidden="true">–</span>
          <label className="sr-only" htmlFor="range-to">To</label>
          <input id="range-to" type="date" className="input w-auto py-1.5" value={state.custom.to} min={state.custom.from}
            onChange={(e) => state.setCustom((c) => ({ ...c, to: e.target.value }))} />
        </div>
      )}
    </div>
  )
}

export function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h) return `${h}h ${m}m`
  if (m) return `${m}m ${sec}s`
  return `${sec}s`
}

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
