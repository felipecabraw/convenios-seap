import { useAppContext } from '../../app/appContext'
import type { PlanoTab } from '../../app/routes'
import { SelectedInstrumentNotice } from '../../components/ui/SelectedInstrumentNotice'
import { Tabs, type TabItem } from '../../components/ui/Tabs'
import { PlanoAjustesTab } from './components/PlanoAjustesTab'
import { PlanoHistoricoTab } from './components/PlanoHistoricoTab'
import { PlanoItensTab } from './components/PlanoItensTab'
import { PlanoSaldoRendimentoTab } from './components/PlanoSaldoRendimentoTab'
import { PlanoSuplementacaoTab } from './components/PlanoSuplementacaoTab'

const tabs: TabItem<PlanoTab>[] = [
  { id: 'itens', label: 'Itens autorizados' },
  { id: 'ajustes', label: 'Ajustes do plano' },
  { id: 'rendimento', label: 'Saldo de rendimento' },
  { id: 'suplementacao', label: 'Suplementação' },
  { id: 'historico', label: 'Histórico de alterações' },
]

export function PlanoTrabalhoPage() {
  const { route, setRoute } = useAppContext()
  const activeTab = route.planoTab ?? 'itens'

  return (
    <div className="grid gap-5">
      <div>
        <p className="sigic-kicker">Planejamento autorizado</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--sigic-ink)]">Plano de Trabalho</h2>
      </div>
      <SelectedInstrumentNotice area="o plano de trabalho" />
      <Tabs activeTab={activeTab} onChange={(tab) => setRoute({ module: 'plano', planoTab: tab })} tabs={tabs} />
      {activeTab === 'itens' && <PlanoItensTab />}
      {activeTab === 'ajustes' && <PlanoAjustesTab />}
      {activeTab === 'rendimento' && <PlanoSaldoRendimentoTab />}
      {activeTab === 'suplementacao' && <PlanoSuplementacaoTab />}
      {activeTab === 'historico' && <PlanoHistoricoTab />}
    </div>
  )
}
