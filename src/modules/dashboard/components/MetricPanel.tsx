import type { ReactNode } from 'react'

export function MetricPanel({
  title,
  value,
  detail,
  icon,
  tone = 'green',
}: {
  title: string
  value: string
  detail?: string
  icon?: ReactNode
  tone?: 'green' | 'gold' | 'slate' | 'danger'
}) {
  const toneClass = {
    green: 'text-[var(--sigic-green)] bg-emerald-50 border-emerald-100',
    gold: 'text-[var(--sigic-warning)] bg-[#fbf4e6] border-[#ead7ad]',
    slate: 'text-slate-700 bg-slate-50 border-slate-200',
    danger: 'text-[var(--sigic-danger)] bg-red-50 border-red-100',
  }[tone]

  return (
    <article className="sigic-panel rounded-lg p-5 transition duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="sigic-kicker">{title}</p>
          <p className="sigic-number mt-3 text-3xl font-black tracking-tight text-[var(--sigic-ink)]">{value}</p>
          {detail && <p className="mt-2 text-sm leading-5 text-[var(--sigic-muted)]">{detail}</p>}
        </div>
        {icon && <div className={`rounded-lg border p-2.5 ${toneClass}`}>{icon}</div>}
      </div>
    </article>
  )
}
