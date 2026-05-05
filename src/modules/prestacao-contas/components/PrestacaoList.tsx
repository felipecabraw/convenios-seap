import { DataTable } from '../../../components/ui/DataTable'
import { EmptyState } from '../../../components/ui/EmptyState'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { prestacaoService } from '../../../services/prestacaoService'

export function PrestacaoList({ instrumentoId, version }: { instrumentoId: string; version: number }) {
  const prestacoes = prestacaoService.listPrestacoesByInstrumento(instrumentoId)

  void version

  if (prestacoes.length === 0) {
    return (
      <EmptyState
        title="Nenhuma prestação cadastrada"
        description="A estrutura inicial já prevê lista, formulário, análise, complementação e histórico."
      />
    )
  }

  return (
    <DataTable
      columns={[
        { key: 'status', header: 'Status', render: (prestacao) => <StatusBadge status={prestacao.status} /> },
        { key: 'especie', header: 'Espécie', render: (prestacao) => prestacao.especie },
        { key: 'periodo', header: 'Período', render: (prestacao) => prestacao.periodo },
        { key: 'relatorio', header: 'Relatório SEI nº', render: (prestacao) => prestacao.relatorioSei || '-' },
        { key: 'envio', header: 'Documento de envio SEI nº', render: (prestacao) => prestacao.documentoEnvioSei || '-' },
        { key: 'complementacao', header: 'Complementação', render: (prestacao) => prestacao.complementacao || '-' },
      ]}
      rows={prestacoes}
    />
  )
}
