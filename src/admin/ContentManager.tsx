// Portfolio Links and Testimonials managers: add, edit, delete, toggle
// active, and drag-and-drop to reorder. Writes go straight to the database,
// so the public pages show the change on their next load.
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ExternalLink, GripVertical, Pencil, Plus, Star, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { services } from '../content/services'
import { db } from '../lib/neon'
import type { Category, PortfolioLink, Testimonial } from '../lib/types'

type Kind = 'portfolio' | 'testimonials'
type Row = PortfolioLink | Testimonial
type Field = { name: string; label: string; type: 'text' | 'url' | 'textarea' | 'rating' | 'checkbox'; required?: boolean }

const config: Record<Kind, { table: string; title: string; singular: string; fields: Field[] }> = {
  portfolio: {
    table: 'portfolio_links',
    title: 'Portfolio links',
    singular: 'link',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'url', label: 'URL', type: 'url', required: true },
      { name: 'description', label: 'Short description', type: 'textarea' },
      { name: 'thumbnail_url', label: 'Thumbnail image URL (optional)', type: 'url' },
    ],
  },
  testimonials: {
    table: 'testimonials',
    title: 'Testimonials',
    singular: 'testimonial',
    fields: [
      { name: 'client_name', label: 'Client name', type: 'text', required: true },
      { name: 'company', label: 'Company', type: 'text' },
      { name: 'quote', label: 'Quote', type: 'textarea', required: true },
      { name: 'rating', label: 'Rating', type: 'rating' },
      { name: 'photo_url', label: 'Photo URL (optional)', type: 'url' },
      { name: 'featured', label: 'Feature on homepage', type: 'checkbox' },
    ],
  },
}

function SortableRow({
  row,
  kind,
  onEdit,
  onDelete,
  onToggle,
}: {
  row: Row
  kind: Kind
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const title = 'title' in row ? row.title : row.client_name
  const subtitle = 'url' in row ? row.url : `${row.company ?? ''} · ${'★'.repeat(row.rating)}`

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 bg-white px-3 py-3 ${isDragging ? 'relative z-10 shadow-lg' : ''} ${row.is_active ? '' : 'opacity-60'}`}
    >
      <button type="button" className="btn-ghost cursor-grab touch-none px-1.5 active:cursor-grabbing" aria-label={`Drag to reorder ${title}`} {...attributes} {...listeners}>
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-medium text-ink">
          <span className="truncate">{title}</span>
          {'featured' in row && row.featured && <Star className="h-4 w-4 shrink-0 fill-accent-400 text-accent-400" aria-label="Featured" />}
        </p>
        <p className="truncate text-xs text-slate-500">{subtitle}</p>
      </div>
      {kind === 'portfolio' && 'url' in row && (
        <a href={row.url} target="_blank" rel="noopener noreferrer" className="btn-ghost hidden px-2 sm:inline-flex" aria-label="Open link">
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
      <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs text-slate-600">
        <input type="checkbox" className="peer sr-only" checked={row.is_active} onChange={onToggle} />
        <span className="relative h-5 w-9 rounded-full bg-slate-300 transition peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4" />
        <span className="hidden w-12 sm:inline">{row.is_active ? 'Active' : 'Hidden'}</span>
      </label>
      <button type="button" className="btn-ghost px-2" onClick={onEdit} aria-label={`Edit ${title}`}>
        <Pencil className="h-4 w-4" />
      </button>
      <button type="button" className="btn-ghost px-2 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={onDelete} aria-label={`Delete ${title}`}>
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  )
}

function EditDialog({
  kind,
  category,
  row,
  onClose,
  onSaved,
}: {
  kind: Kind
  category: Category
  row: Row | null
  onClose: () => void
  onSaved: () => void
}) {
  const cfg = config[kind]
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const base: Record<string, unknown> = { category, rating: 5, featured: false }
    for (const f of cfg.fields) base[f.name] = row ? (row as unknown as Record<string, unknown>)[f.name] ?? '' : base[f.name] ?? ''
    if (row) base.category = row.category
    return base
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function save(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const payload: Record<string, unknown> = { category: values.category }
    for (const f of cfg.fields) {
      const v = values[f.name]
      payload[f.name] = typeof v === 'string' ? v.trim() || null : v
    }
    const q = row
      ? db.from(cfg.table).update(payload).eq('id', row.id)
      : db.from(cfg.table).insert({ ...payload, display_order: Date.now() % 1_000_000_000, is_active: true })
    const { error } = await q
    setBusy(false)
    if (error) return setError(error.message)
    onSaved()
  }

  const set = (name: string, v: unknown) => setValues((s) => ({ ...s, [name]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="edit-title" className="relative max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-t-2xl bg-white p-6 sm:rounded-2xl">
        <button type="button" onClick={onClose} className="btn-ghost absolute top-3 right-3 h-9 w-9 p-0" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
        <h2 id="edit-title" className="text-lg">{row ? 'Edit' : 'Add'} {cfg.singular}</h2>

        <div>
          <label htmlFor="f-category" className="label">Category</label>
          <select id="f-category" className="input" value={String(values.category)} onChange={(e) => set('category', e.target.value)}>
            <option value="website">Website Building</option>
            <option value="ai">AI Automation</option>
          </select>
        </div>

        {cfg.fields.map((f) => (
          <div key={f.name}>
            {f.type === 'checkbox' ? (
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" className="h-4 w-4 accent-brand-600" checked={Boolean(values[f.name])} onChange={(e) => set(f.name, e.target.checked)} />
                {f.label}
              </label>
            ) : (
              <>
                <label htmlFor={`f-${f.name}`} className="label">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea id={`f-${f.name}`} rows={3} className="input" required={f.required} value={String(values[f.name] ?? '')} onChange={(e) => set(f.name, e.target.value)} />
                ) : f.type === 'rating' ? (
                  <select id={`f-${f.name}`} className="input" value={Number(values[f.name] ?? 5)} onChange={(e) => set(f.name, Number(e.target.value))}>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>
                    ))}
                  </select>
                ) : (
                  <input id={`f-${f.name}`} type={f.type} className="input" required={f.required} value={String(values[f.name] ?? '')} onChange={(e) => set(f.name, e.target.value)} />
                )}
              </>
            )}
          </div>
        ))}

        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  )
}

export default function ContentManager({ kind }: { kind: Kind }) {
  const cfg = config[kind]
  const [category, setCategory] = useState<Category>('website')
  const [rows, setRows] = useState<Row[] | null>(null)
  const [editing, setEditing] = useState<Row | 'new' | null>(null)
  const [error, setError] = useState('')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  const load = useCallback(async () => {
    const { data, error } = await db.from(cfg.table).select('*').eq('category', category).order('display_order').order('created_at')
    if (error) setError(error.message)
    setRows((data as Row[]) ?? [])
  }, [cfg.table, category])

  useEffect(() => {
    setRows(null)
    load()
  }, [load])

  async function onDragEnd(e: DragEndEvent) {
    if (!rows || !e.over || e.active.id === e.over.id) return
    const from = rows.findIndex((r) => r.id === e.active.id)
    const to = rows.findIndex((r) => r.id === e.over!.id)
    const next = arrayMove(rows, from, to).map((r, i) => ({ ...r, display_order: i + 1 }))
    setRows(next)
    const changed = next.filter((r, i) => rows[i]?.id !== r.id || rows[i]?.display_order !== r.display_order)
    const results = await Promise.all(changed.map((r) => db.from(cfg.table).update({ display_order: r.display_order }).eq('id', r.id)))
    const failed = results.find((r) => r.error)
    if (failed?.error) {
      setError(failed.error.message)
      load()
    }
  }

  async function toggle(row: Row) {
    setRows((rs) => rs?.map((r) => (r.id === row.id ? { ...r, is_active: !r.is_active } : r)) ?? null)
    const { error } = await db.from(cfg.table).update({ is_active: !row.is_active }).eq('id', row.id)
    if (error) {
      setError(error.message)
      load()
    }
  }

  async function remove(row: Row) {
    const name = 'title' in row ? row.title : row.client_name
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return
    const { error } = await db.from(cfg.table).delete().eq('id', row.id)
    if (error) setError(error.message)
    load()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl">{cfg.title}</h1>
        <button type="button" className="btn-primary" onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" /> Add {cfg.singular}
        </button>
      </div>

      <div className="flex gap-1 border-b border-slate-200" role="tablist">
        {(['website', 'ai'] as Category[]).map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={category === c}
            onClick={() => setCategory(c)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${category === c ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-ink'}`}
          >
            {services[c].navLabel}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error} <button type="button" className="underline" onClick={() => setError('')}>dismiss</button>
        </p>
      )}

      <div className="card overflow-hidden">
        {rows === null ? (
          <div className="space-y-2 p-3">{Array.from({ length: 3 }, (_, i) => <div key={i} className="skeleton h-12" />)}</div>
        ) : rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-400">Nothing here yet. Click “Add {cfg.singular}” to create one.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              <ul className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <SortableRow key={row.id} row={row} kind={kind} onEdit={() => setEditing(row)} onDelete={() => remove(row)} onToggle={() => toggle(row)} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
      <p className="text-xs text-slate-500">Drag the handle to reorder. Hidden items are not shown on the public site.</p>

      {editing && (
        <EditDialog
          kind={kind}
          category={category}
          row={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
          }}
        />
      )}
    </div>
  )
}
