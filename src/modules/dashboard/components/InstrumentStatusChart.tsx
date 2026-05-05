import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function InstrumentStatusChart({ data }: { data: Array<{ label: string; value: number }> }) {
  return (
    <div className="h-64">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 18, right: 8 }}>
          <CartesianGrid horizontal={false} stroke="#e5ece8" />
          <XAxis allowDecimals={false} type="number" />
          <YAxis dataKey="label" tick={{ fontSize: 12 }} type="category" width={125} />
          <Tooltip />
          <Bar dataKey="value" fill="var(--sigic-green)" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
