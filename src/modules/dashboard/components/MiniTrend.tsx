export function MiniTrend({ values }: { values: number[] }) {
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = Math.max(max - min, 1)
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 180
      const y = 54 - ((value - min) / range) * 44
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg aria-label="Tendência financeira compacta" className="h-16 w-full" preserveAspectRatio="none" viewBox="0 0 180 64">
      <polyline fill="none" points={points} stroke="var(--sigic-gold)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
      <polyline fill="none" opacity="0.18" points={points} stroke="var(--sigic-gold)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" />
    </svg>
  )
}
