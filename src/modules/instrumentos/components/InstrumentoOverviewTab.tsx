import { ClipboardText, FileText, ListChecks } from '@phosphor-icons/react'
import type { Instrumento } from '../../../data/database.types'
import { useAppContext } from '../../../app/appContext'
import { Button } from '../../../components/ui/Button'
import { SummaryCard } from '../../../components/ui/SummaryCard'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { calcularDiasRestantes, calcularResumoContratacoes, calcularResumoFinanceiro, calcularResumoPlano } from '../../../utils/calculations'
import { formatCurrency, formatPercent } from '../../../utils/formatters'

export function InstrumentoOverviewTab({ instrumento }: { instrumento: Instrumento }) {
  const { setRoute } = useAppContext()
  const financeiro = calcularResumoFinanceiro(instrumento.id)
  const plano = calcularResumoPlano(instrumento.id)
  const contratacoes = calcularResumoContratacoes(instrumento.id)

  return (
    <div className="grid gap-5">
      <section className="sigic-panel rounded-xl p-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm font-bold text-[#1f6f5f]">{instrumento.numeroInternoSeap}</p>
            <h3 className="mt-2 text-xl font-black text-[var(--sigic-ink)]">{instrumento.tipo} nº {instrumento.numero}</h3>
            <p className="mt-2 text-sm text-slate-500">{instrumento.normativo || 'Normativo não informado'}</p>
          </div>
          <StatusBadge status={instrumento.status} />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button icon={<ListChecks size={17} weight="bold" />} onClick={() => setRoute({ module: 'plano', planoTab: 'itens' })}>
            Cadastrar itens do plano
          </Button>
          <Button icon={<ClipboardText size={17} weight="bold" />} onClick={() => setRoute({ module: 'execucao' })} variant="secondary">
            Cadastrar contratação
          </Button>
          <Button icon={<FileText size={17} weight="bold" />} onClick={() => setRoute({ module: 'prestacao' })} variant="secondary">
            Cadastrar prestação
          </Button>
        </div>
      </section>
      <section className="grid grid-cols-4 gap-4">
        <SummaryCard title="Dias de vigência" value={String(calcularDiasRestantes(instrumento.vigenciaFinal))} detail="Campo calculado" />
        <SummaryCard title="Valor global" value={formatCurrency(financeiro.valorGlobal)} />
        <SummaryCard title="Plano autorizado" value={formatCurrency(plano.valorAutorizado)} detail={`${plano.totalItens} item(ns)`} />
        <SummaryCard title="Contratado" value={formatCurrency(contratacoes.valorContratado)} detail={`${contratacoes.totalContratacoes} contratação(ões)`} />
      </section>
      <section className="sigic-panel rounded-xl p-5">
        <p className="text-sm font-bold text-[var(--sigic-ink)]">Execução financeira</p>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-[#1f6f5f]" style={{ width: `${Math.min(financeiro.percentualExecutado, 100)}%` }} />
        </div>
        <p className="mt-2 text-sm text-slate-500">{formatPercent(financeiro.percentualExecutado)} executado</p>
      </section>
    </div>
  )
}
