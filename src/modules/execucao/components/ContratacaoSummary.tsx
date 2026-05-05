import type { Contratacao } from '../../../data/database.types'
import { SummaryCard } from '../../../components/ui/SummaryCard'
import { formatCurrency } from '../../../utils/formatters'

export function ContratacaoSummary({ contratacoes }: { contratacoes: Contratacao[] }) {
  const valorContratado = contratacoes.reduce((total, contratacao) => total + contratacao.valorTotalContratado, 0)
  const valorPago = contratacoes.reduce((total, contratacao) => total + contratacao.obValor, 0)

  return (
    <section className="grid grid-cols-3 gap-4">
      <SummaryCard title="Contratações" value={String(contratacoes.length)} detail="Registros locais" />
      <SummaryCard title="Valor contratado" value={formatCurrency(valorContratado)} />
      <SummaryCard title="Valor pago" value={formatCurrency(valorPago)} detail="Somatório de OB" />
    </section>
  )
}
