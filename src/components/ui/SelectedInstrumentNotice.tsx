import { ArrowSquareOut, Info, WarningCircle } from '@phosphor-icons/react'
import { useAppContext } from '../../app/appContext'
import { calcularDiasRestantes } from '../../utils/calculations'
import { Button } from './Button'
import { StatusBadge } from './StatusBadge'

export function SelectedInstrumentNotice({ area }: { area: string }) {
  const { selectedInstrumento, setRoute } = useAppContext()

  if (!selectedInstrumento) {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="flex items-center gap-2 font-bold">
          <WarningCircle size={18} weight="bold" />
          Nenhum instrumento selecionado
        </div>
        <p className="mt-2">Selecione ou cadastre um instrumento antes de lançar informações em {area}.</p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-emerald-200 bg-[#f4fbf8] p-4 shadow-[0_14px_34px_-30px_rgba(23,77,67,0.45)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--sigic-green)]">
              <Info size={16} weight="bold" />
              Instrumento selecionado para {area}
            </span>
            <StatusBadge status={selectedInstrumento.status} />
          </div>
          <p className="mt-2 truncate text-lg font-black text-[var(--sigic-ink)]">
            {selectedInstrumento.numeroInternoSeap} · {selectedInstrumento.tipo} nº {selectedInstrumento.numero}
          </p>
          <p className="mt-1 text-sm leading-5 text-[var(--sigic-muted)]">
            Tudo que for cadastrado nesta tela será vinculado a este instrumento. Vigência final: {selectedInstrumento.vigenciaFinal} · {calcularDiasRestantes(selectedInstrumento.vigenciaFinal)} dias restantes.
          </p>
        </div>
        <Button
          icon={<ArrowSquareOut size={17} weight="bold" />}
          onClick={() => setRoute({ module: 'instrumentos', instrumentosTab: 'overview' })}
          variant="secondary"
        >
          Ver instrumento
        </Button>
      </div>
    </section>
  )
}
