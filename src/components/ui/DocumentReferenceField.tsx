import type { DocumentoReferencia } from '../../data/database.types'
import { Input } from './Input'

interface DocumentReferenceFieldProps {
  label: string
  value: DocumentoReferencia
  onChange: (value: DocumentoReferencia) => void
}

export function DocumentReferenceField({ label, value, onChange }: DocumentReferenceFieldProps) {
  return (
    <div className="grid gap-3">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Nome"
          value={value.nome}
          onChange={(event) => onChange({ ...value, nome: event.target.value })}
        />
        <Input
          label="SEI nº"
          value={value.seiNumero ?? ''}
          onChange={(event) => onChange({ ...value, seiNumero: event.target.value })}
        />
      </div>
    </div>
  )
}
