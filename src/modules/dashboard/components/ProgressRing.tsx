import { formatPercent } from '../../../utils/formatters'

export function ProgressRing({
  value,
  label,
  detail,
}: {
  value: number
  label: string
  detail: string
}) {
  const normalized = Math.max(0, Math.min(value, 100))
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (normalized / 100) * circumference

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-36 w-36 shrink-0">
        <svg className="-rotate-90" height="144" viewBox="0 0 144 144" width="144">
          <circle cx="72" cy="72" fill="none" r={radius} stroke="#e5ece8" strokeWidth="14" />
          <circle
            cx="72"
            cy="72"
            fill="none"
            r={radius}
            stroke="var(--sigic-green)"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            strokeWidth="14"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <span className="sigic-number text-2xl font-black text-[var(--sigic-ink)]">{formatPercent(normalized)}</span>
        </div>
      </div>
      <div>
        <p className="sigic-kicker">{label}</p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--sigic-muted)]">{detail}</p>
      </div>
    </div>
  )
}
