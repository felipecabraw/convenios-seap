import { FormSection } from '../../../components/ui/FormSection'
import { formatCurrency } from '../../../utils/formatters'
import type { DadosGeraisForm } from './InstrumentoDadosGeraisForm'
import type { FinanceiroForm } from './InstrumentoFinanceiroForm'
import type { GestaoForm } from './InstrumentoGestaoForm'

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.06em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--sigic-ink)]">{value || '-'}</p>
    </div>
  )
}

export function InstrumentoReviewStep({
  dados,
  financeiro,
  gestao,
}: {
  dados: DadosGeraisForm
  financeiro: FinanceiroForm
  gestao: GestaoForm
}) {
  return (
    <FormSection title="Revisão e criar" description="Confira os dados antes de criar o instrumento central.">
      <div className="grid grid-cols-3 gap-5">
        <Row label="Nº Interno SEAP" value={dados.numeroInternoSeap} />
        <Row label="Instrumento" value={dados.tipo} />
        <Row label="nº" value={dados.numero} />
        <Row label="Ano" value={dados.anoFormalizacao} />
        <Row label="Vigência" value={`${dados.vigenciaInicial || '-'} a ${dados.vigenciaFinal || '-'}`} />
        <Row label="Valor Global" value={formatCurrency(financeiro.valorGlobal)} />
        <Row label="Banco" value={financeiro.banco} />
        <Row label="Conta" value={financeiro.contaBancaria} />
        <Row label="Fiscal" value={gestao.fiscalInstrumento} />
      </div>
    </FormSection>
  )
}
