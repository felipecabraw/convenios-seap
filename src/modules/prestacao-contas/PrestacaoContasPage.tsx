import { useState } from 'react'
import { useAppContext } from '../../app/appContext'
import { SelectedInstrumentNotice } from '../../components/ui/SelectedInstrumentNotice'
import { PrestacaoAnalisePanel } from './components/PrestacaoAnalisePanel'
import { PrestacaoForm } from './components/PrestacaoForm'
import { PrestacaoList } from './components/PrestacaoList'

export function PrestacaoContasPage() {
  const { selectedInstrumentoId } = useAppContext()
  const [version, setVersion] = useState(0)

  return (
    <div className="grid gap-5">
      <div>
        <p className="sigic-kicker">Encerramento e análise</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--sigic-ink)]">Prestação de Contas</h2>
      </div>
      <SelectedInstrumentNotice area="prestação de contas" />
      <section className="grid grid-cols-[1fr_420px] gap-5">
        <PrestacaoList instrumentoId={selectedInstrumentoId} version={version} />
        <PrestacaoForm instrumentoId={selectedInstrumentoId} onCreated={() => setVersion((current) => current + 1)} />
      </section>
      <PrestacaoAnalisePanel instrumentoId={selectedInstrumentoId} />
    </div>
  )
}
