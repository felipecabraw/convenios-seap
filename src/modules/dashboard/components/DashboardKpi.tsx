import type { ReactNode } from 'react'

export function DashboardKpi({
  title,
  value,
  detail,
  icon,
}: {
  title: string
  value: string
  detail: string
  icon: ReactNode
}) {
  return (
    <article className="sigic-panel overflow-hidden rounded-xl p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_40px] items-start gap-3">
        <div className="min-w-0">
          <p className="sigic-kicker">{title}</p>
          <p className="sigic-number mt-3 whitespace-nowrap text-[clamp(1.35rem,1.65vw,1.85rem)] font-black leading-tight tracking-tight text-[var(--sigic-ink)]">
            {value}
          </p>
          <p className="mt-2 text-sm leading-5 text-[var(--sigic-muted)]">{detail}</p>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-emerald-100 bg-emerald-50 text-[var(--sigic-green)]">
          {icon}
        </div>
      </div>
    </article>
  )
}
