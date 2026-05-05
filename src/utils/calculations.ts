import { contratacaoService } from '../services/contratacaoService'
import { instrumentoService } from '../services/instrumentoService'
import { planoService } from '../services/planoService'
import type { Instrumento } from '../data/database.types'

export function calcularDiasRestantes(dataFinal: string) {
  if (!dataFinal) return 0
  const hoje = new Date()
  const final = new Date(`${dataFinal}T00:00:00`)
  const diff = final.getTime() - hoje.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function calcularValorTotal(quantidade: number, valorUnitario: number) {
  return quantidade * valorUnitario
}

export function calcularPercentualExecutado(valorExecutado: number, valorGlobal: number) {
  if (valorGlobal <= 0) return 0
  return (valorExecutado / valorGlobal) * 100
}

export function calcularResumoFinanceiro(instrumentoId: string) {
  const financeiro = instrumentoService.getFinanceiroByInstrumento(instrumentoId)
  if (!financeiro) {
    return { valorGlobal: 0, recursoExecutado: 0, saldoConta: 0, percentualExecutado: 0 }
  }

  return {
    valorGlobal: financeiro.valorGlobal,
    recursoExecutado: financeiro.recursoExecutado,
    saldoConta: financeiro.saldoConta,
    percentualExecutado: calcularPercentualExecutado(financeiro.recursoExecutado, financeiro.valorGlobal),
  }
}

export function calcularResumoPlano(instrumentoId: string) {
  const itens = planoService.listPlanoItensByInstrumento(instrumentoId)
  const valorAutorizado = itens.reduce(
    (total, item) => total + calcularValorTotal(item.quantidade, item.valorUnitarioAutorizado),
    0,
  )

  return { totalItens: itens.length, valorAutorizado }
}

export function calcularResumoContratacoes(instrumentoId: string) {
  const contratacoes = contratacaoService.listContratacoesByInstrumento(instrumentoId)
  const valorContratado = contratacoes.reduce(
    (total, contratacao) => total + contratacao.valorTotalContratado,
    0,
  )

  return { totalContratacoes: contratacoes.length, valorContratado }
}

export function calcularResumoCarteira(instrumentos: Instrumento[]) {
  return instrumentos.reduce(
    (resumo, instrumento) => {
      const financeiro = calcularResumoFinanceiro(instrumento.id)

      return {
        totalInstrumentos: resumo.totalInstrumentos + 1,
        valorGlobal: resumo.valorGlobal + financeiro.valorGlobal,
        recursoExecutado: resumo.recursoExecutado + financeiro.recursoExecutado,
        saldoConta: resumo.saldoConta + financeiro.saldoConta,
        alertas: resumo.alertas + instrumento.alertas.length,
      }
    },
    {
      totalInstrumentos: 0,
      valorGlobal: 0,
      recursoExecutado: 0,
      saldoConta: 0,
      alertas: 0,
    },
  )
}

export function calcularDistribuicaoPorStatus(instrumentos: Instrumento[]) {
  return Object.values(
    instrumentos.reduce<Record<string, { label: string; value: number }>>((acc, instrumento) => {
      acc[instrumento.status] = acc[instrumento.status] ?? { label: instrumento.status, value: 0 }
      acc[instrumento.status].value += 1
      return acc
    }, {}),
  )
}

export function calcularDistribuicaoPorTipo(instrumentos: Instrumento[]) {
  return Object.values(
    instrumentos.reduce<Record<string, { label: string; value: number }>>((acc, instrumento) => {
      acc[instrumento.tipo] = acc[instrumento.tipo] ?? { label: instrumento.tipo, value: 0 }
      acc[instrumento.tipo].value += 1
      return acc
    }, {}),
  )
}

export function calcularRiscosPrazo(instrumentos: Instrumento[]) {
  return instrumentos
    .map((instrumento) => {
      const diasVigencia = calcularDiasRestantes(instrumento.vigenciaFinal)
      const diasClausula = calcularDiasRestantes(instrumento.dataFinalClausulaSuspensiva)

      return {
        instrumento,
        diasVigencia,
        diasClausula,
        nivel: diasVigencia < 90 || diasClausula < 45 ? 'Crítico' : diasVigencia < 180 ? 'Atenção' : 'Regular',
      }
    })
    .sort((a, b) => Math.min(a.diasVigencia, a.diasClausula) - Math.min(b.diasVigencia, b.diasClausula))
}
