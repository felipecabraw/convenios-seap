import { ClipboardText, FileText, Gauge, TrendUp, WarningCircle } from '@phosphor-icons/react'
import { useAppContext } from '../../app/appContext'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import {
  calcularDistribuicaoPorStatus,
  calcularDistribuicaoPorTipo,
  calcularResumoCarteira,
  calcularResumoContratacoes,
  calcularResumoFinanceiro,
  calcularRiscosPrazo,
} from '../../utils/calculations'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { AlertTimeline, type TimelineItem } from './components/AlertTimeline'
import { ChartCard } from './components/ChartCard'
import { DashboardKpi } from './components/DashboardKpi'
import { FinancialExecutionChart } from './components/FinancialExecutionChart'
import { FinancialTrendChart } from './components/FinancialTrendChart'
import { InstrumentStatusChart } from './components/InstrumentStatusChart'
import { InstrumentTypeChart } from './components/InstrumentTypeChart'

export function DashboardPage() {
  const { instrumentos, selectedInstrumento, setRoute, setSelectedInstrumentoId } = useAppContext()
  const resumoInstrumento = selectedInstrumento ? calcularResumoFinanceiro(selectedInstrumento.id) : undefined
  const resumoContratacoes = selectedInstrumento ? calcularResumoContratacoes(selectedInstrumento.id) : undefined
  const carteira = calcularResumoCarteira(instrumentos)
  const percentualCarteira = carteira.valorGlobal > 0 ? (carteira.recursoExecutado / carteira.valorGlobal) * 100 : 0
  const statusData = calcularDistribuicaoPorStatus(instrumentos)
  const tipoData = calcularDistribuicaoPorTipo(instrumentos).slice(0, 5)
  const timelineItems: TimelineItem[] = calcularRiscosPrazo(instrumentos)
    .slice(0, 4)
    .map((risco) => ({
      id: risco.instrumento.id,
      title: risco.nivel === 'Crítico' ? 'Prazo em ponto crítico' : risco.nivel === 'Atenção' ? 'Prazo exige acompanhamento' : 'Prazo regular',
      detail: `${risco.diasVigencia} dias de vigência · ${risco.diasClausula} dias de cláusula suspensiva`,
      instrumento: risco.instrumento,
      tone: risco.nivel === 'Crítico' ? 'critical' : risco.nivel === 'Atenção' ? 'warning' : 'regular',
    }))

  const formatCompactCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value)

  return (
    <div className="grid gap-5">
      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="sigic-panel overflow-hidden rounded-xl">
          <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_230px]">
            <div>
              <p className="sigic-kicker">Painel Gerencial</p>
              <h2 className="mt-2 max-w-3xl text-2xl font-black tracking-tight text-[var(--sigic-ink)]">
                Instrumentos institucionais e convênios
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--sigic-muted)]">
                Visão executiva com dados locais simulados, consolidando execução financeira, alertas, prazos e distribuição dos instrumentos.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button icon={<FileText size={18} weight="bold" />} onClick={() => setRoute({ module: 'instrumentos' })}>
                  Ver instrumento
                </Button>
                <Button variant="secondary" onClick={() => setRoute({ module: 'execucao' })}>
                  Execução
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-[#d8c08a]/50 bg-[#fbf4e6] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--sigic-warning)]">Instrumento selecionado</p>
              <p className="mt-2 text-base font-black leading-tight text-[var(--sigic-ink)]">
                {selectedInstrumento?.numeroInternoSeap ?? 'Sem seleção'}
              </p>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--sigic-muted)]">
                {selectedInstrumento?.tipo ?? 'Selecione um instrumento para detalhar a execução.'}
              </p>
              {selectedInstrumento && (
                <div className="mt-3">
                  <StatusBadge status={selectedInstrumento.status} />
                </div>
              )}
            </div>
          </div>
          <div className="grid divide-y divide-[var(--sigic-border)] border-t border-[var(--sigic-border)] bg-slate-50/60 md:grid-cols-3 md:divide-x md:divide-y-0">
            <div className="p-3.5">
              <p className="sigic-kicker">Valor global</p>
              <p className="sigic-number mt-1.5 text-lg font-black text-[var(--sigic-ink)]">{formatCurrency(carteira.valorGlobal)}</p>
            </div>
            <div className="p-3.5">
              <p className="sigic-kicker">Executado</p>
              <p className="sigic-number mt-1.5 text-lg font-black text-[var(--sigic-ink)]">{formatCurrency(carteira.recursoExecutado)}</p>
            </div>
            <div className="p-3.5">
              <p className="sigic-kicker">Saldo em conta</p>
              <p className="sigic-number mt-1.5 text-lg font-black text-[var(--sigic-ink)]">{formatCurrency(carteira.saldoConta)}</p>
            </div>
          </div>
        </div>

        <div className="sigic-panel rounded-xl p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--sigic-warning)]">
            <WarningCircle size={19} weight="bold" />
            Alertas e prazos
          </div>
          <div className="mt-4 max-h-[235px] overflow-auto pr-1">
            <AlertTimeline items={timelineItems} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardKpi detail="Instrumentos ativos na base local" icon={<FileText size={21} weight="bold" />} title="Instrumentos" value={String(carteira.totalInstrumentos)} />
        <DashboardKpi detail={`${formatPercent(percentualCarteira)} dos instrumentos`} icon={<TrendUp size={21} weight="bold" />} title="Execução" value={formatCompactCurrency(carteira.recursoExecutado)} />
        <DashboardKpi detail={`${resumoContratacoes?.totalContratacoes ?? 0} contratação(ões) no instrumento selecionado`} icon={<ClipboardText size={21} weight="bold" />} title="Contratado" value={formatCompactCurrency(resumoContratacoes?.valorContratado ?? 0)} />
        <DashboardKpi detail="Alertas cadastrados nos instrumentos" icon={<Gauge size={21} weight="bold" />} title="Risco" value={`${carteira.alertas} alerta(s)`} />
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="grid gap-5">
          <ChartCard kicker="Execução" title="Execução financeira do instrumento">
            <FinancialExecutionChart
              recursoExecutado={resumoInstrumento?.recursoExecutado ?? 0}
              valorGlobal={resumoInstrumento?.valorGlobal ?? 0}
            />
          </ChartCard>
          <ChartCard kicker="Evolução" title="Evolução financeira simulada">
            <FinancialTrendChart value={resumoInstrumento?.recursoExecutado ?? 0} />
          </ChartCard>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-1">
          <ChartCard
            action={<span className="rounded-full border border-[var(--sigic-border)] bg-white px-3 py-1 text-xs font-bold text-slate-600">{instrumentos.length} registro(s)</span>}
            kicker="Distribuição"
            title="Status dos instrumentos"
          >
            <InstrumentStatusChart data={statusData} />
          </ChartCard>

          <ChartCard kicker="Composição" title="Tipos de instrumento">
            <InstrumentTypeChart data={tipoData} />
          </ChartCard>
        </div>
      </section>

      <section className="sigic-panel rounded-xl p-5">
        <div className="mb-2 flex items-center justify-between gap-4">
          <div>
            <p className="sigic-kicker">Instrumentos</p>
            <h3 className="mt-1.5 text-lg font-black text-[var(--sigic-ink)]">Instrumentos recentes</h3>
          </div>
          <Button variant="secondary" onClick={() => setRoute({ module: 'instrumentos' })}>
            Abrir módulo
          </Button>
        </div>
        <div className="divide-y divide-slate-100">
          {instrumentos.map((instrumento) => {
            const resumo = calcularResumoFinanceiro(instrumento.id)

            return (
              <button
                className="grid w-full grid-cols-[minmax(0,1fr)_110px_140px] items-center gap-4 py-3.5 text-left transition hover:bg-slate-50"
                key={instrumento.id}
                onClick={() => {
                  setSelectedInstrumentoId(instrumento.id)
                  setRoute({ module: 'instrumentos', instrumentosTab: 'overview' })
                }}
                type="button"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-[var(--sigic-ink)]">{instrumento.numeroInternoSeap}</p>
                  <p className="mt-1 truncate text-sm text-[var(--sigic-muted)]">{instrumento.tipo} · {instrumento.numero}</p>
                </div>
                <p className="sigic-number text-sm font-bold text-slate-700">{formatPercent(resumo.percentualExecutado)}</p>
                <StatusBadge status={instrumento.status} />
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
