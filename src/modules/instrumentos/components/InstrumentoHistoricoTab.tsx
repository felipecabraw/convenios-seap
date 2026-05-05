import { EmptyState } from '../../../components/ui/EmptyState'
import { instrumentoService } from '../../../services/instrumentoService'
import { formatDate } from '../../../utils/formatters'

export function InstrumentoHistoricoTab({ instrumentoId }: { instrumentoId: string }) {
  const eventos = instrumentoService.listHistoricoByInstrumento(instrumentoId)

  if (eventos.length === 0) {
    return <EmptyState title="Sem histórico registrado" description="Eventos institucionais do instrumento aparecerão aqui." />
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="divide-y divide-slate-100">
        {eventos.map((evento) => (
          <article className="grid grid-cols-[160px_1fr] gap-5 py-4" key={evento.id}>
            <p className="text-sm font-bold text-slate-500">{formatDate(evento.data)}</p>
            <div>
              <h3 className="text-sm font-bold text-slate-950">{evento.titulo}</h3>
              <p className="mt-1 text-sm text-slate-600">{evento.descricao}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.06em] text-slate-400">{evento.responsavel}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
