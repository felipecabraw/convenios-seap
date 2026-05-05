import type { ReactNode } from 'react'

export function ChartCard({
  title,
  kicker,
  action,
  children,
}: {
  title: string
  kicker: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="sigic-panel rounded-xl p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="sigic-kicker">{kicker}</p>
          <h3 className="mt-1.5 text-lg font-black text-[var(--sigic-ink)]">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
