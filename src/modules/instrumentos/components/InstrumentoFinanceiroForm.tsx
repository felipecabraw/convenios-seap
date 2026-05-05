import { CurrencyInput } from '../../../components/ui/CurrencyInput'
import { DateInput } from '../../../components/ui/DateInput'
import { FormSection } from '../../../components/ui/FormSection'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import type { Banco, NaturezaDespesa } from '../../../data/database.types'
import { bancoOptions, naturezaDespesaOptions } from '../../../domains/options'

export interface FinanceiroForm {
  banco: Banco
  contaBancaria: string
  naturezaDespesa: NaturezaDespesa
  valorGlobal: number
  repasseParticipe: number
  repasseSeap: number
  saldoConta: number
  dataAtualizacaoSaldoConta: string
  publicacaoDoeSitePncp: string
}

export function InstrumentoFinanceiroForm({
  value,
  onChange,
}: {
  value: FinanceiroForm
  onChange: (value: FinanceiroForm) => void
}) {
  return (
    <FormSection title="Financeiro" description="Dados financeiros iniciais do instrumento.">
      <div className="grid grid-cols-3 gap-4">
        <Select label="Banco" options={bancoOptions} value={value.banco} onChange={(event) => onChange({ ...value, banco: event.target.value as Banco })} />
        <Input label="Conta bancária" value={value.contaBancaria} onChange={(event) => onChange({ ...value, contaBancaria: event.target.value })} />
        <Select label="Natureza de despesa" options={naturezaDespesaOptions} value={value.naturezaDespesa} onChange={(event) => onChange({ ...value, naturezaDespesa: event.target.value as NaturezaDespesa })} />
        <CurrencyInput label="Valor Global" value={value.valorGlobal} onChange={(amount) => onChange({ ...value, valorGlobal: amount })} />
        <CurrencyInput label="Repasse Partícipe" value={value.repasseParticipe} onChange={(amount) => onChange({ ...value, repasseParticipe: amount })} />
        <CurrencyInput label="Repasse SEAP" value={value.repasseSeap} onChange={(amount) => onChange({ ...value, repasseSeap: amount })} />
        <CurrencyInput label="Saldo em conta" value={value.saldoConta} onChange={(amount) => onChange({ ...value, saldoConta: amount })} />
        <DateInput label="Data de atualização do Saldo em conta" value={value.dataAtualizacaoSaldoConta} onChange={(date) => onChange({ ...value, dataAtualizacaoSaldoConta: date })} />
        <Input label="Publicação no DOE, Site, PNCP" value={value.publicacaoDoeSitePncp} onChange={(event) => onChange({ ...value, publicacaoDoeSitePncp: event.target.value })} />
      </div>
    </FormSection>
  )
}
