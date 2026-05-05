import { localDatabase } from '../data/localDatabase'
import type {
  CreateInput,
  HistoricoEvento,
  Instrumento,
  InstrumentoFinanceiro,
  InstrumentoGestao,
  UpdateInput,
} from '../data/database.types'

export interface InstrumentoCompletoInput {
  instrumento: CreateInput<Instrumento>
  financeiro: Omit<CreateInput<InstrumentoFinanceiro>, 'instrumentoId'>
  gestao: Omit<CreateInput<InstrumentoGestao>, 'instrumentoId'>
  historico: Omit<CreateInput<HistoricoEvento>, 'instrumentoId'>
}

export const instrumentoRepository = {
  listInstrumentos() {
    return localDatabase.list<Instrumento>('instrumentos')
  },

  getInstrumentoById(id: string) {
    return localDatabase.findById<Instrumento>('instrumentos', id)
  },

  createInstrumento(data: CreateInput<Instrumento>) {
    return localDatabase.create<Instrumento>('instrumentos', data)
  },

  updateInstrumento(id: string, data: UpdateInput<Instrumento>) {
    return localDatabase.update<Instrumento>('instrumentos', id, data)
  },

  createInstrumentoCompleto(data: InstrumentoCompletoInput) {
    const instrumento = localDatabase.create<Instrumento>('instrumentos', data.instrumento)
    const financeiro = localDatabase.create<InstrumentoFinanceiro>('instrumentoFinanceiros', {
      ...data.financeiro,
      instrumentoId: instrumento.id,
    })
    const gestao = localDatabase.create<InstrumentoGestao>('instrumentoGestoes', {
      ...data.gestao,
      instrumentoId: instrumento.id,
    })
    const historico = localDatabase.create<HistoricoEvento>('historicoEventos', {
      ...data.historico,
      instrumentoId: instrumento.id,
    })

    return { instrumento, financeiro, gestao, historico }
  },

  getFinanceiroByInstrumento(instrumentoId: string) {
    return localDatabase
      .list<InstrumentoFinanceiro>('instrumentoFinanceiros')
      .find((financeiro) => financeiro.instrumentoId === instrumentoId)
  },

  getGestaoByInstrumento(instrumentoId: string) {
    return localDatabase
      .list<InstrumentoGestao>('instrumentoGestoes')
      .find((gestao) => gestao.instrumentoId === instrumentoId)
  },

  listHistoricoByInstrumento(instrumentoId: string) {
    return localDatabase
      .list<HistoricoEvento>('historicoEventos')
      .filter((evento) => evento.instrumentoId === instrumentoId)
  },

  createHistoricoEvento(data: CreateInput<HistoricoEvento>) {
    return localDatabase.create<HistoricoEvento>('historicoEventos', data)
  },

  updateInstrumentoFinanceiro(instrumentoId: string, data: UpdateInput<InstrumentoFinanceiro>) {
    const financeiro = this.getFinanceiroByInstrumento(instrumentoId)
    if (!financeiro) return undefined

    return localDatabase.update<InstrumentoFinanceiro>('instrumentoFinanceiros', financeiro.id, data)
  },

  updateInstrumentoGestao(instrumentoId: string, data: UpdateInput<InstrumentoGestao>) {
    const gestao = this.getGestaoByInstrumento(instrumentoId)
    if (!gestao) return undefined

    return localDatabase.update<InstrumentoGestao>('instrumentoGestoes', gestao.id, data)
  },
}
