import { DataTable } from '../../components/ui/DataTable'
import { EmptyState } from '../../components/ui/EmptyState'
import { NEXT_STEP_MESSAGE } from '../../domains/constants'
import {
  bancoOptions,
  categoriaItemOptions,
  instrumentoStatusOptions,
  instrumentoTipos,
  naturezaAquisicaoOptions,
  naturezaDespesaOptions,
  prestacaoStatusOptions,
  situacaoRepasseSeapOptions,
  statusAnaliseOptions,
  statusItemPlanoOptions,
  statusProcessoContratacaoOptions,
} from '../../domains/options'

interface DomainRow {
  id: string
  dominio: string
  total: number
  exemplos: string
}

export function ConfiguracoesPage() {
  const rows: DomainRow[] = [
    { id: 'tipos', dominio: 'Tipos de instrumento', total: instrumentoTipos.length, exemplos: instrumentoTipos.slice(0, 3).join(', ') },
    { id: 'status-instrumento', dominio: 'Status do instrumento', total: instrumentoStatusOptions.length, exemplos: instrumentoStatusOptions.slice(0, 3).join(', ') },
    { id: 'bancos', dominio: 'Bancos', total: bancoOptions.length, exemplos: bancoOptions.slice(0, 3).join(', ') },
    { id: 'naturezas', dominio: 'Naturezas de despesa', total: naturezaDespesaOptions.length, exemplos: naturezaDespesaOptions.join(', ') },
    { id: 'categorias', dominio: 'Categorias de item', total: categoriaItemOptions.length, exemplos: categoriaItemOptions.join(', ') },
    { id: 'aquisicao', dominio: 'Naturezas de aquisição', total: naturezaAquisicaoOptions.length, exemplos: naturezaAquisicaoOptions.slice(0, 3).join(', ') },
    { id: 'contratacao', dominio: 'Status de contratação', total: statusProcessoContratacaoOptions.length, exemplos: statusProcessoContratacaoOptions.join(', ') },
    { id: 'itens', dominio: 'Status de item do plano', total: statusItemPlanoOptions.length, exemplos: statusItemPlanoOptions.join(', ') },
    { id: 'repasse', dominio: 'Situação do repasse SEAP', total: situacaoRepasseSeapOptions.length, exemplos: situacaoRepasseSeapOptions.join(', ') },
    { id: 'prestacao', dominio: 'Status de prestação', total: prestacaoStatusOptions.length, exemplos: prestacaoStatusOptions.slice(0, 3).join(', ') },
    { id: 'analise', dominio: 'Status de análise', total: statusAnaliseOptions.length, exemplos: statusAnaliseOptions.slice(0, 3).join(', ') },
  ]

  return (
    <div className="grid gap-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#1f6f5f]">Parametrização</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Configurações / Domínios</h2>
      </div>
      <EmptyState title="Domínios editáveis em etapa futura" description={`${NEXT_STEP_MESSAGE}. Por enquanto, as opções estão centralizadas em arquivos TypeScript para facilitar revisão e migração.`} />
      <DataTable
        columns={[
          { key: 'dominio', header: 'Domínio', render: (row) => <span className="font-semibold text-slate-950">{row.dominio}</span> },
          { key: 'total', header: 'Opções', render: (row) => row.total },
          { key: 'exemplos', header: 'Exemplos', render: (row) => row.exemplos },
        ]}
        rows={rows}
      />
    </div>
  )
}
