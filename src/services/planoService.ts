import { planoRepository } from '../repositories/planoRepository'

export const planoService = {
  listPlanoItensByInstrumento: planoRepository.listPlanoItensByInstrumento,
  createPlanoItem: planoRepository.createPlanoItem,
  updatePlanoItem: planoRepository.updatePlanoItem,
  deletePlanoItem: planoRepository.deletePlanoItem,
  listAjustesByInstrumento: planoRepository.listAjustesByInstrumento,
  listSaldosRendimentoByInstrumento: planoRepository.listSaldosRendimentoByInstrumento,
  listSuplementacoesByInstrumento: planoRepository.listSuplementacoesByInstrumento,
}
