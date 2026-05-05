import { DataTable } from '../../../components/ui/DataTable'
import { EmptyState } from '../../../components/ui/EmptyState'
import { useAppContext } from '../../../app/appContext'
import { planoService } from '../../../services/planoService'
import { formatCurrency } from '../../../utils/formatters'

export function PlanoSaldoRendimentoTab() {
  const { selectedInstrumentoId } = useAppContext()
  const saldos = planoService.listSaldosRendimentoByInstrumento(selectedInstrumentoId)

  if (saldos.length === 0) {
    return <EmptyState title="Sem saldo de rendimento autorizado" description="A tela já está preparada para status, documentos SEI, upload e valor autorizado." />
  }

  return (
    <DataTable
      columns={[
        { key: 'status', header: 'Status', render: (saldo) => saldo.status },
        { key: 'solicitacao', header: 'Solicitação SEI', render: (saldo) => saldo.documentoSolicitacaoSei },
        { key: 'autorizacao', header: 'Autorização SEI', render: (saldo) => saldo.documentoAutorizacaoSei || '-' },
        { key: 'valor', header: 'Valor autorizado', render: (saldo) => formatCurrency(saldo.valorAutorizado) },
      ]}
      rows={saldos}
    />
  )
}
