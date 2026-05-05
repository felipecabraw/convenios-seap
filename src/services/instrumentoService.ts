import { instrumentoRepository } from '../repositories/instrumentoRepository'

export const instrumentoService = {
  listInstrumentos: instrumentoRepository.listInstrumentos,
  getInstrumentoById: instrumentoRepository.getInstrumentoById,
  createInstrumento: instrumentoRepository.createInstrumento,
  createInstrumentoCompleto: instrumentoRepository.createInstrumentoCompleto,
  updateInstrumento: instrumentoRepository.updateInstrumento,
  getFinanceiroByInstrumento: instrumentoRepository.getFinanceiroByInstrumento,
  getGestaoByInstrumento: instrumentoRepository.getGestaoByInstrumento,
  listHistoricoByInstrumento: instrumentoRepository.listHistoricoByInstrumento,
  createHistoricoEvento: instrumentoRepository.createHistoricoEvento,
  updateInstrumentoFinanceiro: instrumentoRepository.updateInstrumentoFinanceiro,
  updateInstrumentoGestao: instrumentoRepository.updateInstrumentoGestao,
}
