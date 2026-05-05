export interface ChartDatum {
  label: string
  value: number
}

export function BarChart({ data, caption }: { data: ChartDatum[]; caption?: string }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="grid gap-4">
      {caption && <p className="text-sm leading-6 text-[var(--sigic-muted)]">{caption}</p>}
      <div className="grid gap-3">
        {data.map((item) => {
          const width = `${Math.max((item.value / maxValue) * 100, 8)}%`

          return (
            <div className="grid gap-1.5" key={item.label}>
              <div className="flex items-center justify-between gap-4 text-xs font-bold text-slate-600">
                <span className="truncate">{item.label}</span>
                <span className="sigic-number">{item.value}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-[var(--sigic-green)]" style={{ width }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
