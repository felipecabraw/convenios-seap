import { WarningCircle } from '@phosphor-icons/react'
import { useAppContext } from '../app/appContext'
import { StatusBadge } from '../components/ui/StatusBadge'
import { calcularDiasRestantes } from '../utils/calculations'

export function ContextBar() {
  const { instrumentos, selectedInstrumento, selectedInstrumentoId, setSelectedInstrumentoId } = useAppContext()

  if (!selectedInstrumento) {
    return (
      <div className="border-b border-[var(--sigic-border)] bg-white px-6 py-4 text-sm text-slate-500">
        Nenhum instrumento disponível na seed.
      </div>
    )
  }

  return (
    <div className="border-b border-[var(--sigic-border)] bg-white px-6 py-4">
      <div className="flex items-center justify-between gap-5">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <p className="truncate text-sm font-bold text-[var(--sigic-ink)]">
              {selectedInstrumento.numeroInternoSeap} · {selectedInstrumento.tipo}
            </p>
            <StatusBadge status={selectedInstrumento.status} />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Vigência até {selectedInstrumento.vigenciaFinal} · {calcularDiasRestantes(selectedInstrumento.vigenciaFinal)} dias restantes
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedInstrumento.alertas.length > 0 && (
            <span className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
              <WarningCircle size={16} weight="bold" />
              {selectedInstrumento.alertas.length} alerta(s)
            </span>
          )}
          <select
            className="min-h-10 min-w-72 rounded-md border border-[var(--sigic-border)] bg-white px-3 text-sm font-semibold text-slate-800"
            onChange={(event) => setSelectedInstrumentoId(event.target.value)}
            value={selectedInstrumentoId}
          >
            {instrumentos.map((instrumento) => (
              <option key={instrumento.id} value={instrumento.id}>
                {instrumento.numeroInternoSeap} · {instrumento.numero}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
