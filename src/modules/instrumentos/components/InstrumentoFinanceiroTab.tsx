import { EmptyState } from '../../../components/ui/EmptyState'
import { FormSection } from '../../../components/ui/FormSection'
import { instrumentoService } from '../../../services/instrumentoService'
import { calcularPercentualExecutado } from '../../../utils/calculations'
import { formatCurrency, formatDate, formatPercent } from '../../../utils/formatters'

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.06em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  )
}

export function InstrumentoFinanceiroTab({ instrumentoId }: { instrumentoId: string }) {
  const financeiro = instrumentoService.getFinanceiroByInstrumento(instrumentoId)

  if (!financeiro) {
    return <EmptyState title="Dados financeiros não cadastrados" description="A estrutura já prevê o registro financeiro individual por instrumento." />
  }

  return (
    <FormSection title="Dados financeiros" description="Valores calculados são exibidos, mas não persistidos como fonte de verdade.">
      <div className="grid grid-cols-3 gap-5">
        <Field label="Banco" value={financeiro.banco} />
        <Field label="Conta bancária" value={financeiro.contaBancaria} />
        <Field label="Natureza de despesa" value={financeiro.naturezaDespesa} />
        <Field label="Valor Global" value={formatCurrency(financeiro.valorGlobal)} />
        <Field label="Repasse Partícipe" value={formatCurrency(financeiro.repasseParticipe)} />
        <Field label="Repasse SEAP" value={formatCurrency(financeiro.repasseSeap)} />
        <Field label="Situação do Repasse SEAP" value={financeiro.situacaoRepasseSeap} />
        <Field label="Saldo em conta" value={formatCurrency(financeiro.saldoConta)} />
        <Field label="Data de atualização do Saldo em conta" value={formatDate(financeiro.dataAtualizacaoSaldoConta)} />
        <Field label="Saldo de Economicidade" value={formatCurrency(financeiro.saldoEconomicidade)} />
        <Field label="Rendimento de Aplicação Existente" value={formatCurrency(financeiro.rendimentoAplicacaoExistente)} />
        <Field label="Rendimento de Aplicação Autorizado" value={formatCurrency(financeiro.rendimentoAplicacaoAutorizado)} />
        <Field label="Recurso Executado" value={formatCurrency(financeiro.recursoExecutado)} />
        <Field label="% Executado" value={formatPercent(calcularPercentualExecutado(financeiro.recursoExecutado, financeiro.valorGlobal))} />
        <Field label="Publicação no DOE, Site, PNCP" value={financeiro.publicacaoDoeSitePncp} />
      </div>
    </FormSection>
  )
}
