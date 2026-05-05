import type { ReactNode } from 'react'

export function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.35)]">
      <div className="mb-5">
        <h2 className="text-base font-bold text-slate-950">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  )
}
