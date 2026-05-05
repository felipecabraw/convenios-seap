import { PencilSimple, Trash } from '@phosphor-icons/react'
import { Button } from '../../../components/ui/Button'
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import type { PlanoItem } from '../../../data/database.types'
import { calcularValorTotal } from '../../../utils/calculations'
import { formatCurrency } from '../../../utils/formatters'

export function PlanoItensTable({
  itens,
  onEdit,
  onDelete,
}: {
  itens: PlanoItem[]
  onEdit: (item: PlanoItem) => void
  onDelete: (id: string) => void
}) {
  const columns: DataTableColumn<PlanoItem>[] = [
    { key: 'descricao', header: 'Item / Objeto', render: (item) => <span className="font-semibold text-slate-950">{item.descricao}</span> },
    { key: 'categoria', header: 'Categoria', render: (item) => item.categoriaItem },
    { key: 'quantidade', header: 'Qtd.', render: (item) => `${item.quantidade} ${item.unidadeMedida}` },
    { key: 'valor', header: 'Valor autorizado', render: (item) => formatCurrency(calcularValorTotal(item.quantidade, item.valorUnitarioAutorizado)) },
    { key: 'status', header: 'Status', render: (item) => <StatusBadge status={item.statusItem} /> },
    {
      key: 'actions',
      header: 'Ações',
      render: (item) => (
        <div className="flex gap-2">
          <Button icon={<PencilSimple size={16} weight="bold" />} onClick={() => onEdit(item)} variant="secondary">Editar</Button>
          <Button icon={<Trash size={16} weight="bold" />} onClick={() => onDelete(item.id)} variant="danger">Excluir</Button>
        </div>
      ),
    },
  ]

  return <DataTable columns={columns} rows={itens} />
}
