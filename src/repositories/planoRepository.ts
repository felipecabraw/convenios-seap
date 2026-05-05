import { localDatabase } from '../data/localDatabase'
import type {
  CreateInput,
  PlanoAjuste,
  PlanoItem,
  PlanoSaldoRendimento,
  PlanoSuplementacao,
  UpdateInput,
} from '../data/database.types'

export const planoRepository = {
  listPlanoItensByInstrumento(instrumentoId: string) {
    return localDatabase
      .list<PlanoItem>('planoItens')
      .filter((item) => item.instrumentoId === instrumentoId)
  },

  createPlanoItem(data: CreateInput<PlanoItem>) {
    return localDatabase.create<PlanoItem>('planoItens', data)
  },

  updatePlanoItem(id: string, data: UpdateInput<PlanoItem>) {
    return localDatabase.update<PlanoItem>('planoItens', id, data)
  },

  deletePlanoItem(id: string) {
    localDatabase.delete('planoItens', id)
  },

  listAjustesByInstrumento(instrumentoId: string) {
    return localDatabase
      .list<PlanoAjuste>('planoAjustes')
      .filter((ajuste) => ajuste.instrumentoId === instrumentoId)
  },

  listSaldosRendimentoByInstrumento(instrumentoId: string) {
    return localDatabase
      .list<PlanoSaldoRendimento>('planoSaldosRendimento')
      .filter((saldo) => saldo.instrumentoId === instrumentoId)
  },

  listSuplementacoesByInstrumento(instrumentoId: string) {
    return localDatabase
      .list<PlanoSuplementacao>('planoSuplementacoes')
      .filter((suplementacao) => suplementacao.instrumentoId === instrumentoId)
  },
}
