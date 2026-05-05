export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(value: string) {
  if (!value) return '-'
  const date = new Date(`${value}T00:00:00`)
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export function formatPercent(value: number) {
  return `${value.toFixed(1).replace('.', ',')}%`
}
