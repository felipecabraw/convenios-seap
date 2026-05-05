import { EmptyState } from '../../../components/ui/EmptyState'
import { useAppContext } from '../../../app/appContext'
import { planoService } from '../../../services/planoService'

export function PlanoAjustesTab() {
  const { selectedInstrumentoId } = useAppContext()
  const ajustes = planoService.listAjustesByInstrumento(selectedInstrumentoId)

  return (
    <EmptyState
      title={ajustes.length === 0 ? 'Ajustes do plano ainda não cadastrados' : 'Ajustes cadastrados'}
      description="Status, documentos SEI, novo período autorizado, termo aditivo e histórico de mudanças já estão modelados para a próxima etapa."
    />
  )
}
