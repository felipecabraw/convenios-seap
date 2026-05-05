import type { Instrumento } from '../../../data/database.types'
import { FormSection } from '../../../components/ui/FormSection'
import { FileUploadField } from '../../../components/ui/FileUploadField'
import { calcularDiasRestantes } from '../../../utils/calculations'
import { formatDate } from '../../../utils/formatters'

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.06em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  )
}

export function InstrumentoDadosGeraisTab({ instrumento }: { instrumento: Instrumento }) {
  return (
    <FormSection title="Dados gerais" description="Fonte de verdade do registro principal do instrumento.">
      <div className="grid grid-cols-3 gap-5">
        <Field label="Nº Interno SEAP" value={instrumento.numeroInternoSeap} />
        <Field label="Status" value={instrumento.status} />
        <Field label="Alertas" value={instrumento.alertas.join('; ') || 'Sem alertas'} />
        <Field label="Prazo final da Cláusula Suspensiva" value={formatDate(instrumento.prazoFinalClausulaSuspensiva)} />
        <Field label="Data final da Cláusula Suspensiva" value={formatDate(instrumento.dataFinalClausulaSuspensiva)} />
        <Field label="Dias Restante da Cláusula Suspensiva" value={calcularDiasRestantes(instrumento.dataFinalClausulaSuspensiva)} />
        <Field label="Modalidade" value={instrumento.modalidade} />
        <Field label="Normativo" value={instrumento.normativo} />
        <Field label="Instrumento" value={instrumento.tipo} />
        <Field label="nº" value={instrumento.numero} />
        <Field label="Ano de formalização" value={instrumento.anoFormalizacao} />
        <Field label="Prazo de validade" value={instrumento.prazoValidade} />
        <Field label="Vigência Inicial" value={formatDate(instrumento.vigenciaInicial)} />
        <Field label="Vigência Final" value={formatDate(instrumento.vigenciaFinal)} />
        <Field label="Dias restantes" value={calcularDiasRestantes(instrumento.vigenciaFinal)} />
        <Field label="Repasse Financeiro?" value={instrumento.repasseFinanceiro} />
        <div className="col-span-2">
          <FileUploadField label="Upload de Termo" />
        </div>
      </div>
    </FormSection>
  )
}
