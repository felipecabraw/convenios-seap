import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const colors = ['#174d43', '#b88a3c', '#62716c', '#21695c', '#d8c08a']

export function InstrumentTypeChart({ data }: { data: Array<{ label: string; value: number }> }) {
  return (
    <div className="grid grid-cols-[170px_1fr] items-center gap-4">
      <div className="h-44">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={42} outerRadius={72} stroke="none">
              {data.map((item, index) => (
                <Cell fill={colors[index % colors.length]} key={item.label} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid gap-2">
        {data.map((item, index) => (
          <span className="flex items-center gap-2 text-xs font-semibold text-slate-700" key={item.label}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[index % colors.length] }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
