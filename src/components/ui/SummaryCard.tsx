import type { ReactNode } from 'react'

export function SummaryCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string
  value: string
  detail?: string
  icon?: ReactNode
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.45)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
          {detail && <p className="mt-2 text-sm text-slate-500">{detail}</p>}
        </div>
        {icon && <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[#1f6f5f]">{icon}</div>}
      </div>
    </article>
  )
}
