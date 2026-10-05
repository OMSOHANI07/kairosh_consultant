export function CardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <div className="skeleton aspect-video rounded-none" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-5 w-2/3" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
      </div>
    </div>
  )
}

export function QuoteSkeleton() {
  return (
    <div className="card space-y-3 p-6" aria-hidden="true">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-4/5" />
      <div className="flex items-center gap-3 pt-2">
        <div className="skeleton h-10 w-10 rounded-full" />
        <div className="skeleton h-4 w-32" />
      </div>
    </div>
  )
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <p className="font-medium text-ink">{title}</p>
      {text && <p className="mt-1 text-sm text-slate-500">{text}</p>}
    </div>
  )
}
