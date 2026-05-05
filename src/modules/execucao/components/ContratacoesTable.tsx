import { PencilSimple, Trash } from '@phosphor-icons/react'
import { Button } from '../../../components/ui/Button'
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import type { Contratacao } from '../../../data/database.types'
import { formatCurrency } from '../../../utils/formatters'

export function ContratacoesTable({
  contratacoes,
  onEdit,
  onDelete,
}: {
  contratacoes: Contratacao[]
  onEdit: (contratacao: Contratacao) => void
  onDelete: (id: string) => void
}) {
  const columns: DataTableColumn<Contratacao>[] = [
    { key: 'processo', header: 'Processo', render: (contratacao) => <span className="font-semibold text-slate-950">{contratacao.processoSei}</span> },
    { key: 'status', header: 'Status', render: (contratacao) => <StatusBadge status={contratacao.statusProcesso} /> },
    { key: 'contrato', header: 'Contrato', render: (contratacao) => contratacao.contratoNumero || '-' },
    { key: 'contratado', header: 'Contratado', render: (contratacao) => contratacao.enteContratado || '-' },
    { key: 'valor', header: 'Valor', render: (contratacao) => formatCurrency(contratacao.valorTotalContratado) },
    { key: 'entrega', header: 'Entrega', render: (contratacao) => contratacao.unidadeBeneficiada || '-' },
    {
      key: 'actions',
      header: 'Ações',
      render: (contratacao) => (
        <div className="flex gap-2">
          <Button icon={<PencilSimple size={16} weight="bold" />} onClick={() => onEdit(contratacao)} variant="secondary">Editar</Button>
          <Button icon={<Trash size={16} weight="bold" />} onClick={() => onDelete(contratacao.id)} variant="danger">Excluir</Button>
        </div>
      ),
    },
  ]

  return <DataTable columns={columns} rows={contratacoes} />
}
