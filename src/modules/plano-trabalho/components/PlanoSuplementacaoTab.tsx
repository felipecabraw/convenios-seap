import { EmptyState } from '../../../components/ui/EmptyState'
import { useAppContext } from '../../../app/appContext'
import { planoService } from '../../../services/planoService'

export function PlanoSuplementacaoTab() {
  const { selectedInstrumentoId } = useAppContext()
  const suplementacoes = planoService.listSuplementacoesByInstrumento(selectedInstrumentoId)

  return (
    <EmptyState
      title={suplementacoes.length === 0 ? 'Sem suplementações cadastradas' : 'Suplementações cadastradas'}
      description="Status, documentos SEI, upload do documento autorizador e valor autorizado já estão previstos na modelagem."
    />
  )
}
