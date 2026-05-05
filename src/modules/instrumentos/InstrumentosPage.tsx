import { PencilSimple, Plus } from '@phosphor-icons/react'
import { useState } from 'react'
import { useAppContext } from '../../app/appContext'
import type { InstrumentosTab } from '../../app/routes'
import { Button } from '../../components/ui/Button'
import { SelectedInstrumentNotice } from '../../components/ui/SelectedInstrumentNotice'
import { Tabs, type TabItem } from '../../components/ui/Tabs'
import { InstrumentoCreatePage } from './InstrumentoCreatePage'
import { InstrumentoDetailPage } from './InstrumentoDetailPage'

const tabs: TabItem<InstrumentosTab>[] = [
  { id: 'overview', label: 'Visão geral' },
  { id: 'dados', label: 'Dados gerais' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'gestao', label: 'Gestão' },
  { id: 'historico', label: 'Histórico' },
]

export function InstrumentosPage() {
  const { route, setRoute, selectedInstrumento } = useAppContext()
  const [message, setMessage] = useState('')
  const activeTab = route.instrumentosTab ?? 'overview'

  if (route.instrumentosMode === 'create') {
    return <InstrumentoCreatePage onCreated={() => setMessage('Instrumento criado e selecionado. Continue pelo plano de trabalho ou execução.')} />
  }

  return (
    <div className="grid gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="sigic-kicker">Módulo central</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--sigic-ink)]">Instrumentos</h2>
          {message && <p className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">{message}</p>}
        </div>
        <div className="flex gap-2">
          <Button icon={<Plus size={17} weight="bold" />} onClick={() => setRoute({ module: 'instrumentos', instrumentosMode: 'create' })}>
            Novo instrumento
          </Button>
          <Button disabled={!selectedInstrumento} icon={<PencilSimple size={17} weight="bold" />} title="Edição completa prevista para próxima etapa" variant="secondary">
            Editar instrumento
          </Button>
        </div>
      </div>
      <SelectedInstrumentNotice area="o módulo de instrumentos" />
      <Tabs
        activeTab={activeTab}
        onChange={(tab) => setRoute({ module: 'instrumentos', instrumentosTab: tab })}
        tabs={tabs}
      />
      <InstrumentoDetailPage activeTab={activeTab} />
    </div>
  )
}
