import type { Instrumento } from '../../../data/database.types'

export interface TimelineItem {
  id: string
  title: string
  detail: string
  tone: 'critical' | 'warning' | 'regular'
  instrumento: Instrumento
}

export function AlertTimeline({ items }: { items: TimelineItem[] }) {
  const toneClass = {
    critical: 'bg-red-700',
    warning: 'bg-amber-600',
    regular: 'bg-emerald-700',
  }

  return (
    <div className="relative grid gap-4 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-slate-200">
      {items.map((item) => (
        <article className="relative grid gap-1 pl-7" key={item.id}>
          <span className={`absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full ring-4 ring-white ${toneClass[item.tone]}`} />
          <p className="text-sm font-bold text-[var(--sigic-ink)]">{item.title}</p>
          <p className="text-xs leading-5 text-[var(--sigic-muted)]">{item.detail}</p>
          <p className="text-xs font-semibold text-slate-500">{item.instrumento.numeroInternoSeap}</p>
        </article>
      ))}
    </div>
  )
}
