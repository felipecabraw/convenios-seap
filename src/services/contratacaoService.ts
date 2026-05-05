import { contratacaoRepository } from '../repositories/contratacaoRepository'

export const contratacaoService = {
  listContratacoesByInstrumento: contratacaoRepository.listContratacoesByInstrumento,
  createContratacao: contratacaoRepository.createContratacao,
  updateContratacao: contratacaoRepository.updateContratacao,
  deleteContratacao: contratacaoRepository.deleteContratacao,
  listContratacaoItensByInstrumento: contratacaoRepository.listContratacaoItensByInstrumento,
}
