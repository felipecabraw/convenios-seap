import type { InstrumentosTab } from '../../app/routes'
import { useAppContext } from '../../app/appContext'
import { EmptyState } from '../../components/ui/EmptyState'
import { InstrumentoDadosGeraisTab } from './components/InstrumentoDadosGeraisTab'
import { InstrumentoFinanceiroTab } from './components/InstrumentoFinanceiroTab'
import { InstrumentoGestaoTab } from './components/InstrumentoGestaoTab'
import { InstrumentoHistoricoTab } from './components/InstrumentoHistoricoTab'
import { InstrumentoOverviewTab } from './components/InstrumentoOverviewTab'

export function InstrumentoDetailPage({ activeTab }: { activeTab: InstrumentosTab }) {
  const { selectedInstrumento } = useAppContext()

  if (!selectedInstrumento) {
    return <EmptyState title="Nenhum instrumento selecionado" description="Cadastre ou selecione um instrumento para iniciar o acompanhamento." />
  }

  if (activeTab === 'dados') return <InstrumentoDadosGeraisTab instrumento={selectedInstrumento} />
  if (activeTab === 'financeiro') return <InstrumentoFinanceiroTab instrumentoId={selectedInstrumento.id} />
  if (activeTab === 'gestao') return <InstrumentoGestaoTab instrumentoId={selectedInstrumento.id} />
  if (activeTab === 'historico') return <InstrumentoHistoricoTab instrumentoId={selectedInstrumento.id} />
  return <InstrumentoOverviewTab instrumento={selectedInstrumento} />
}
