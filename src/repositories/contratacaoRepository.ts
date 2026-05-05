import { localDatabase } from '../data/localDatabase'
import type { Contratacao, ContratacaoItem, CreateInput, UpdateInput } from '../data/database.types'

export const contratacaoRepository = {
  listContratacoesByInstrumento(instrumentoId: string) {
    return localDatabase
      .list<Contratacao>('contratacoes')
      .filter((contratacao) => contratacao.instrumentoId === instrumentoId)
  },

  createContratacao(data: CreateInput<Contratacao>) {
    return localDatabase.create<Contratacao>('contratacoes', data)
  },

  updateContratacao(id: string, data: UpdateInput<Contratacao>) {
    return localDatabase.update<Contratacao>('contratacoes', id, data)
  },

  deleteContratacao(id: string) {
    localDatabase.delete('contratacoes', id)
  },

  listContratacaoItensByInstrumento(instrumentoId: string) {
    return localDatabase
      .list<ContratacaoItem>('contratacaoItens')
      .filter((vinculo) => vinculo.instrumentoId === instrumentoId)
  },
}
