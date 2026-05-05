import { localDatabase } from '../data/localDatabase'
import type { CreateInput, PrestacaoAnalise, PrestacaoConta } from '../data/database.types'

export const prestacaoRepository = {
  listPrestacoesByInstrumento(instrumentoId: string) {
    return localDatabase
      .list<PrestacaoConta>('prestacoesConta')
      .filter((prestacao) => prestacao.instrumentoId === instrumentoId)
  },

  createPrestacao(data: CreateInput<PrestacaoConta>) {
    return localDatabase.create<PrestacaoConta>('prestacoesConta', data)
  },

  listAnalisesByInstrumento(instrumentoId: string) {
    return localDatabase
      .list<PrestacaoAnalise>('prestacaoAnalises')
      .filter((analise) => analise.instrumentoId === instrumentoId)
  },
}
