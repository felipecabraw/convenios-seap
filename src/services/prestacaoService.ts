import { prestacaoRepository } from '../repositories/prestacaoRepository'

export const prestacaoService = {
  listPrestacoesByInstrumento: prestacaoRepository.listPrestacoesByInstrumento,
  createPrestacao: prestacaoRepository.createPrestacao,
  listAnalisesByInstrumento: prestacaoRepository.listAnalisesByInstrumento,
}
