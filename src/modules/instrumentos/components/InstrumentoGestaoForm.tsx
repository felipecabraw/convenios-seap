import { FormSection } from '../../../components/ui/FormSection'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import type { SimNao } from '../../../data/database.types'
import { simNaoOptions } from '../../../domains/options'

export interface GestaoForm {
  fiscalInstrumento: string
  portariaSei: string
  substatus: string
  prorrogacao: SimNao
}

export function InstrumentoGestaoForm({
  value,
  onChange,
}: {
  value: GestaoForm
  onChange: (value: GestaoForm) => void
}) {
  return (
    <FormSection title="Gestão" description="Responsáveis e situação administrativa inicial.">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Fiscal do Instrumento" value={value.fiscalInstrumento} onChange={(event) => onChange({ ...value, fiscalInstrumento: event.target.value })} />
        <Input label="Portaria SEI nº" value={value.portariaSei} onChange={(event) => onChange({ ...value, portariaSei: event.target.value })} />
        <Input label="Substatus" value={value.substatus} onChange={(event) => onChange({ ...value, substatus: event.target.value })} />
        <Select label="Prorrogação" options={simNaoOptions} value={value.prorrogacao} onChange={(event) => onChange({ ...value, prorrogacao: event.target.value as SimNao })} />
      </div>
    </FormSection>
  )
}
