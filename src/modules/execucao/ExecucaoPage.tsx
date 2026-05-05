import { SelectedInstrumentNotice } from '../../components/ui/SelectedInstrumentNotice'
import { ContratacoesTab } from './components/ContratacoesTab'

export function ExecucaoPage() {
  return (
    <div className="grid gap-5">
      <div>
        <p className="sigic-kicker">Execução física e financeira</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--sigic-ink)]">Execução / Contratações</h2>
      </div>
      <SelectedInstrumentNotice area="execução e contratações" />
      <ContratacoesTab />
    </div>
  )
}
