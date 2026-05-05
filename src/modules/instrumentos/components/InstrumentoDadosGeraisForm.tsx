import { DateInput } from '../../../components/ui/DateInput'
import { FormSection } from '../../../components/ui/FormSection'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import type { InstrumentoTipo, Modalidade, SimNao } from '../../../data/database.types'
import { instrumentoTipos, modalidadeOptions, simNaoOptions } from '../../../domains/options'

export interface DadosGeraisForm {
  numeroInternoSeap: string
  modalidade: Modalidade
  normativo: string
  tipo: InstrumentoTipo
  numero: string
  anoFormalizacao: number
  prazoValidade: string
  vigenciaInicial: string
  vigenciaFinal: string
  prazoFinalClausulaSuspensiva: string
  dataFinalClausulaSuspensiva: string
  repasseFinanceiro: SimNao
}

export function InstrumentoDadosGeraisForm({
  value,
  onChange,
}: {
  value: DadosGeraisForm
  onChange: (value: DadosGeraisForm) => void
}) {
  return (
    <FormSection title="Dados gerais" description="Registro principal do instrumento.">
      <div className="grid grid-cols-3 gap-4">
        <Input label="Nº Interno SEAP" value={value.numeroInternoSeap} onChange={(event) => onChange({ ...value, numeroInternoSeap: event.target.value })} />
        <Select label="Instrumento" options={instrumentoTipos} value={value.tipo} onChange={(event) => onChange({ ...value, tipo: event.target.value as InstrumentoTipo })} />
        <Input label="nº" value={value.numero} onChange={(event) => onChange({ ...value, numero: event.target.value })} />
        <Input label="Ano de formalização" type="number" value={value.anoFormalizacao} onChange={(event) => onChange({ ...value, anoFormalizacao: Number(event.target.value) })} />
        <Select label="Modalidade" options={modalidadeOptions} value={value.modalidade} onChange={(event) => onChange({ ...value, modalidade: event.target.value as Modalidade })} />
        <Input label="Normativo" value={value.normativo} onChange={(event) => onChange({ ...value, normativo: event.target.value })} />
        <Input label="Prazo de validade" value={value.prazoValidade} onChange={(event) => onChange({ ...value, prazoValidade: event.target.value })} />
        <DateInput label="Vigência Inicial" value={value.vigenciaInicial} onChange={(date) => onChange({ ...value, vigenciaInicial: date })} />
        <DateInput label="Vigência Final" value={value.vigenciaFinal} onChange={(date) => onChange({ ...value, vigenciaFinal: date })} />
        <DateInput label="Prazo final da Cláusula Suspensiva" value={value.prazoFinalClausulaSuspensiva} onChange={(date) => onChange({ ...value, prazoFinalClausulaSuspensiva: date })} />
        <DateInput label="Data final da Cláusula Suspensiva" value={value.dataFinalClausulaSuspensiva} onChange={(date) => onChange({ ...value, dataFinalClausulaSuspensiva: date })} />
        <Select label="Repasse Financeiro?" options={simNaoOptions} value={value.repasseFinanceiro} onChange={(event) => onChange({ ...value, repasseFinanceiro: event.target.value as SimNao })} />
      </div>
    </FormSection>
  )
}
