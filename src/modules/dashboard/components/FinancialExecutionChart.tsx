import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency, formatPercent } from '../../../utils/formatters'

export function FinancialExecutionChart({
  valorGlobal,
  recursoExecutado,
}: {
  valorGlobal: number
  recursoExecutado: number
}) {
  const restante = Math.max(valorGlobal - recursoExecutado, 0)
  const percentual = valorGlobal > 0 ? (recursoExecutado / valorGlobal) * 100 : 0
  const data = [
    { name: 'Executado', value: recursoExecutado, color: 'var(--sigic-green)' },
    { name: 'A executar', value: restante, color: '#e4ebe7' },
  ]

  return (
    <div className="grid grid-cols-[190px_1fr] items-center gap-5">
      <div className="relative h-48">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={62} outerRadius={82} paddingAngle={2} stroke="none">
              {data.map((item) => (
                <Cell fill={item.color} key={item.name} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 grid place-items-center text-center">
          <p className="sigic-number text-2xl font-black text-[var(--sigic-ink)]">{formatPercent(percentual)}</p>
        </div>
      </div>
      <div>
        <p className="text-sm leading-6 text-[var(--sigic-muted)]">
          {formatCurrency(recursoExecutado)} executados de {formatCurrency(valorGlobal)} no instrumento selecionado.
        </p>
        <div className="mt-4 grid gap-2 text-sm">
          <span className="flex items-center gap-2 font-semibold text-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--sigic-green)]" />
            Executado
          </span>
          <span className="flex items-center gap-2 font-semibold text-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-[#e4ebe7]" />
            A executar
          </span>
        </div>
      </div>
    </div>
  )
}
