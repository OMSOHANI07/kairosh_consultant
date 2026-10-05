import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { db } from '../lib/neon'
import type { Overview as OverviewData } from '../lib/types'
import { DateRangePicker, formatDuration, useDateRange } from './dateRange'

// Chart colours follow the brand palette in src/theme.css.
const BRAND = '#157f73'
const ACCENT = '#f59e0b'
const PIE = ['#157f73', '#f59e0b', '#64748b', '#78d5c3']

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

function Panel({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card p-5 ${className}`}>
      <h2 className="mb-4 text-base">{title}</h2>
      {children}
    </section>
  )
}

const Empty = () => <p className="py-10 text-center text-sm text-slate-400">No data for this period yet.</p>

export default function Overview() {
  const dr = useDateRange('30d')
  const [data, setData] = useState<OverviewData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setData(null)
    setError('')
    db.rpc('admin_overview', { p_from: dr.range.from.toISOString(), p_to: dr.range.to.toISOString() }).then(
      ({ data, error }) => {
        if (cancelled) return
        if (error) setError(error.message)
        else setData(data as OverviewData)
      },
    )
    return () => {
      cancelled = true
    }
  }, [dr.range])

  const conversion = data && data.popup_shown ? Math.round((100 * data.popup_completed) / data.popup_shown) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl">Overview</h1>
        <DateRangePicker state={dr} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {data ? (
          <>
            <Stat label="Page views" value={data.page_views} hint="Includes pre-consent anonymous views" />
            <Stat label="Unique visitors" value={data.unique_visitors} hint="Consenting visitors" />
            <Stat label="Logged-in customers" value={data.customers} hint={`${data.new_customers} new in period`} />
            <Stat label="Sessions" value={data.sessions} />
            <Stat label="Avg. session" value={formatDuration(data.avg_session_seconds)} />
            <Stat label="Bounce rate" value={`${data.bounce_rate}%`} hint="Sessions with ≤ 1 page view" />
            <Stat label="Contact leads" value={data.leads} />
            <Stat label="Login conversion" value={`${conversion}%`} hint={`${data.popup_completed} of ${data.popup_shown} popups`} />
          </>
        ) : (
          Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)
        )}
      </div>

      {data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Visitors per day" className="lg:col-span-2">
            {data.per_day.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.per_day} margin={{ left: -20, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} tickFormatter={(d: string) => d.slice(5)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="visitors" name="Unique visitors" stroke={BRAND} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="views" name="Page views" stroke={ACCENT} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Empty />
            )}
          </Panel>

          <Panel title="Most viewed pages">
            {data.top_pages.length ? (
              <ResponsiveContainer width="100%" height={Math.max(160, data.top_pages.length * 34)}>
                <BarChart data={data.top_pages} layout="vertical" margin={{ left: 10, right: 16 }}>
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="path" width={130} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="views" name="Views" fill={BRAND} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty />
            )}
          </Panel>

          <Panel title="Device split">
            {data.devices.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.devices} dataKey="visitors" nameKey="device" innerRadius={50} outerRadius={85} label>
                    {data.devices.map((d, i) => (
                      <Cell key={d.device} fill={PIE[i % PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty />
            )}
          </Panel>

          <Panel title="Top referrers" className="lg:col-span-2">
            {data.top_referrers.length ? (
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-slate-500 uppercase">
                  <tr><th className="pb-2">Source</th><th className="pb-2 text-right">Sessions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.top_referrers.map((r) => (
                    <tr key={r.source}><td className="py-2">{r.source}</td><td className="py-2 text-right tabular-nums">{r.sessions}</td></tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Empty />
            )}
          </Panel>
        </div>
      )}
    </div>
  )
}
