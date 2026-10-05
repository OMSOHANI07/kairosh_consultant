import { Mail, Phone, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../lib/neon'
import type { Lead, LeadStatus } from '../lib/types'
import { formatDateTime } from './dateRange'

const statusStyle: Record<LeadStatus, string> = {
  new: 'bg-brand-100 text-brand-800',
  contacted: 'bg-amber-100 text-amber-800',
  closed: 'bg-slate-200 text-slate-700',
}

function LeadCard({ lead, onChange, onDelete }: { lead: Lead; onChange: (l: Lead) => void; onDelete: () => void }) {
  const [notes, setNotes] = useState(lead.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const dirty = notes !== (lead.notes ?? '')

  async function update(patch: Partial<Pick<Lead, 'status' | 'notes'>>) {
    setSaving(true)
    setError('')
    const { error } = await db.from('leads').update(patch).eq('id', lead.id)
    setSaving(false)
    if (error) return setError(error.message)
    onChange({ ...lead, ...patch })
  }

  return (
    <li className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{lead.name}</p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1 text-brand-700 hover:underline">
              <Mail className="h-4 w-4" /> {lead.email}
            </a>
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1 text-brand-700 hover:underline">
                <Phone className="h-4 w-4" /> {lead.phone}
              </a>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {formatDateTime(lead.created_at)}
            {lead.visitor_id && (
              <>
                {' · '}
                <Link to={`/admin/visitors/${lead.visitor_id}`} className="underline">view journey</Link>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor={`status-${lead.id}`} className="sr-only">Status</label>
          <select
            id={`status-${lead.id}`}
            value={lead.status}
            disabled={saving}
            onChange={(e) => update({ status: e.target.value as LeadStatus })}
            className={`rounded-full border-0 px-3 py-1 text-xs font-semibold ${statusStyle[lead.status]}`}
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="closed">Closed</option>
          </select>
          <button type="button" onClick={onDelete} className="btn-ghost px-2 text-red-600 hover:bg-red-50" aria-label={`Delete lead from ${lead.name}`}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm whitespace-pre-wrap text-slate-700">{lead.message}</p>
      <div className="mt-3">
        <label htmlFor={`notes-${lead.id}`} className="label">Notes</label>
        <textarea id={`notes-${lead.id}`} rows={2} className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Private notes about this lead" />
        <div className="mt-2 flex items-center justify-end gap-3">
          {error && <span className="text-sm text-red-600">{error}</span>}
          <button type="button" className="btn-secondary py-1.5" disabled={!dirty || saving} onClick={() => update({ notes: notes.trim() || null })}>
            {saving ? 'Saving…' : 'Save notes'}
          </button>
        </div>
      </div>
    </li>
  )
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[] | null>(null)
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const { data, error } = await db.from('leads').select('*').order('created_at', { ascending: false }).limit(500)
    if (error) setError(error.message)
    setLeads((data as Lead[]) ?? [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function remove(lead: Lead) {
    if (!window.confirm(`Delete the lead from ${lead.name}? This cannot be undone.`)) return
    const { error } = await db.from('leads').delete().eq('id', lead.id)
    if (error) return setError(error.message)
    setLeads((ls) => ls?.filter((l) => l.id !== lead.id) ?? null)
  }

  const counts = (leads ?? []).reduce<Record<string, number>>((acc, l) => ({ ...acc, [l.status]: (acc[l.status] ?? 0) + 1 }), {})
  const visible = (leads ?? []).filter((l) => filter === 'all' || l.status === filter)

  return (
    <div className="space-y-5">
      <h1 className="text-2xl">Leads</h1>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {(['all', 'new', 'contacted', 'closed'] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={filter === s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${filter === s ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'}`}
          >
            {s} {s === 'all' ? `(${leads?.length ?? 0})` : `(${counts[s] ?? 0})`}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {leads === null ? (
        <div className="space-y-3">{Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>
      ) : visible.length === 0 ? (
        <p className="card p-10 text-center text-sm text-slate-400">No leads yet.</p>
      ) : (
        <ul className="space-y-4">
          {visible.map((l) => (
            <LeadCard key={l.id} lead={l} onDelete={() => remove(l)} onChange={(n) => setLeads((ls) => ls?.map((x) => (x.id === n.id ? n : x)) ?? null)} />
          ))}
        </ul>
      )}
    </div>
  )
}
