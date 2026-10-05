import { Download, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../lib/neon'
import type { VisitorRow } from '../lib/types'
import { DateRangePicker, formatDateTime, formatDuration, useDateRange } from './dateRange'

function csvEscape(v: unknown) {
  const s = v == null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function exportCsv(rows: VisitorRow[]) {
  const headers = ['visitor_id', 'customer_id', 'email', 'phone', 'phone_verified', 'first_seen', 'last_seen', 'sessions', 'total_seconds', 'source', 'device', 'country', 'city'] as const
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(','))].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `visitors-${new Date().toISOString().slice(0, 10)}.csv` })
  a.click()
  URL.revokeObjectURL(url)
}

export default function Visitors() {
  const dr = useDateRange('30d')
  const navigate = useNavigate()
  const [rows, setRows] = useState<VisitorRow[] | null>(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [filter, setFilter] = useState<'all' | 'customers' | 'anonymous'>('all')
  const [source, setSource] = useState('')

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim()), 300)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => {
    let cancelled = false
    setRows(null)
    db.rpc('admin_visitors', {
      p_from: dr.range.from.toISOString(),
      p_to: dr.range.to.toISOString(),
      p_search: debounced || null,
    }).then(({ data, error }) => {
      if (cancelled) return
      if (error) setError(error.message)
      setRows((data as VisitorRow[]) ?? [])
    })
    return () => {
      cancelled = true
    }
  }, [dr.range, debounced])

  const sources = useMemo(() => [...new Set((rows ?? []).map((r) => r.source))].sort(), [rows])
  const visible = useMemo(
    () =>
      (rows ?? []).filter(
        (r) =>
          (filter === 'all' || (filter === 'customers' ? r.customer_id : !r.customer_id)) && (!source || r.source === source),
      ),
    [rows, filter, source],
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl">Visitors &amp; customers</h1>
        <DateRangePicker state={dr} />
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <label htmlFor="visitor-search" className="sr-only">Search</label>
          <input id="visitor-search" className="input pl-9" placeholder="Search by ID, email or phone" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <label className="sr-only" htmlFor="visitor-filter">Visitor type</label>
        <select id="visitor-filter" className="input md:w-44" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
          <option value="all">All visitors</option>
          <option value="customers">Logged-in only</option>
          <option value="anonymous">Anonymous only</option>
        </select>
        <label className="sr-only" htmlFor="visitor-source">Source</label>
        <select id="visitor-source" className="input md:w-44" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="button" className="btn-secondary" onClick={() => exportCsv(visible)} disabled={!visible.length}>
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">Visitor / customer</th>
              <th className="px-4 py-3">Email / phone</th>
              <th className="px-4 py-3">First seen</th>
              <th className="px-4 py-3">Last seen</th>
              <th className="px-4 py-3 text-right">Sessions</th>
              <th className="px-4 py-3 text-right">Time on site</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Device / location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows === null &&
              Array.from({ length: 6 }, (_, i) => (
                <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="skeleton h-5" /></td></tr>
              ))}
            {rows !== null && !visible.length && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">No visitors match these filters.</td></tr>
            )}
            {visible.map((r) => (
              <tr
                key={r.visitor_id}
                tabIndex={0}
                onClick={() => navigate(`/admin/visitors/${r.visitor_id}`)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/admin/visitors/${r.visitor_id}`)}
                className="cursor-pointer hover:bg-brand-50/50 focus:bg-brand-50"
              >
                <td className="px-4 py-3 font-mono text-xs">
                  <div>{r.visitor_id.slice(0, 8)}…</div>
                  {r.customer_id && <div className="text-brand-700">cust {r.customer_id.slice(0, 8)}…</div>}
                </td>
                <td className="px-4 py-3">
                  {r.email || r.phone ? (
                    <>
                      {r.email && <div>{r.email}</div>}
                      {r.phone && (
                        <div>
                          {r.phone} {r.phone_verified === false && <span className="rounded bg-amber-100 px-1.5 text-xs text-amber-800">unverified</span>}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-400">Anonymous</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(r.first_seen)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(r.last_seen)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{r.sessions}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatDuration(r.total_seconds)}</td>
                <td className="px-4 py-3">{r.source}</td>
                <td className="px-4 py-3 text-slate-500">
                  {r.device ?? '—'}
                  {(r.city || r.country) && <div className="text-xs">{[r.city, r.country].filter(Boolean).join(', ')}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows && rows.length >= 1000 && <p className="text-xs text-slate-500">Showing the 1,000 most recent visitors. Narrow the date range to see more.</p>}
    </div>
  )
}
