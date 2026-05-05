import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency } from '../../../utils/formatters'

export function FinancialTrendChart({ value }: { value: number }) {
  const data = [
    { mes: 'Jan', valor: value * 0.18 },
    { mes: 'Fev', valor: value * 0.22 },
    { mes: 'Mar', valor: value * 0.27 },
    { mes: 'Abr', valor: value * 0.34 },
    { mes: 'Mai', valor: value * 0.44 },
    { mes: 'Jun', valor: value },
  ]

  return (
    <div className="h-44">
      <ResponsiveContainer height="100%" width="100%">
        <AreaChart data={data}>
          <CartesianGrid stroke="#e5ece8" vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(tick) => `${Math.round(Number(tick) / 1000)}k`} width={45} />
          <Tooltip formatter={(tooltipValue) => formatCurrency(Number(tooltipValue))} />
          <Area dataKey="valor" fill="rgba(184,138,60,0.18)" stroke="var(--sigic-gold)" strokeWidth={3} type="monotone" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
