import { DataTable } from '../../../components/ui/DataTable'
import { EmptyState } from '../../../components/ui/EmptyState'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { prestacaoService } from '../../../services/prestacaoService'

export function PrestacaoAnalisePanel({ instrumentoId }: { instrumentoId: string }) {
  const analises = prestacaoService.listAnalisesByInstrumento(instrumentoId)

  if (analises.length === 0) {
    return <EmptyState title="Sem análise cadastrada" description="A análise técnica, área responsável, documentos SEI e status já possuem entidade própria." />
  }

  return (
    <DataTable
      columns={[
        { key: 'analise', header: 'Análise', render: (analise) => analise.analise },
        { key: 'area', header: 'Área Técnica', render: (analise) => analise.areaTecnica },
        { key: 'documento', header: 'Documento de análise SEI nº', render: (analise) => analise.documentoAnaliseSei },
        { key: 'status', header: 'Status da análise', render: (analise) => <StatusBadge status={analise.statusAnalise} /> },
        { key: 'posterior', header: 'Documento de análise SEI nº posterior', render: (analise) => analise.documentoAnalisePosteriorSei || '-' },
      ]}
      rows={analises}
    />
  )
}
