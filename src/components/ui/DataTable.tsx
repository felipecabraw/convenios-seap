import type { ReactNode } from 'react'

export interface DataTableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
}

export function DataTable<T extends { id: string }>({ columns, rows }: { columns: DataTableColumn<T>[]; rows: T[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.06em] text-slate-500">
          <tr>
            {columns.map((column) => (
              <th className="border-b border-slate-200 px-4 py-3" key={column.key}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr className="align-top hover:bg-slate-50/70" key={row.id}>
              {columns.map((column) => (
                <td className="px-4 py-3 text-slate-700" key={column.key}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
