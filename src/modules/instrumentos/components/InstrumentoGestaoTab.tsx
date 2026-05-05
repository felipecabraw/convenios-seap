import { EmptyState } from '../../../components/ui/EmptyState'
import { FormSection } from '../../../components/ui/FormSection'
import { instrumentoService } from '../../../services/instrumentoService'

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.06em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  )
}

export function InstrumentoGestaoTab({ instrumentoId }: { instrumentoId: string }) {
  const gestao = instrumentoService.getGestaoByInstrumento(instrumentoId)

  if (!gestao) {
    return <EmptyState title="Gestão não cadastrada" description="A estrutura já prevê fiscal, portaria, substatus e prorrogação." />
  }

  return (
    <FormSection title="Gestão">
      <div className="grid grid-cols-4 gap-5">
        <Field label="Fiscal do Instrumento" value={gestao.fiscalInstrumento} />
        <Field label="Portaria SEI nº" value={gestao.portariaSei} />
        <Field label="Substatus" value={gestao.substatus} />
        <Field label="Prorrogação" value={gestao.prorrogacao} />
      </div>
    </FormSection>
  )
}
