export type SimNao = 'Sim' | 'Não'

export type InstrumentoTipo =
  | 'Convênio'
  | 'Fundo a Fundo obrigatório'
  | 'Fundo a Fundo voluntário'
  | 'Contrato de Repasse'
  | 'Emenda Parlamentar Estadual'
  | 'Emenda Parlamentar Federal'
  | 'Penas Pecuniárias'
  | 'Termo de Colaboração'
  | 'Termo de Fomento'
  | 'Acordo de Cooperação Técnico'
  | 'Parceria com entidade privada'

export type InstrumentoStatus =
  | 'Em elaboração'
  | 'Vigente'
  | 'Cláusula suspensiva'
  | 'Em execução'
  | 'Prestação de contas'
  | 'Concluído'
  | 'Suspenso'

export type Modalidade = 'Obrigatória' | 'Voluntária' | 'Parlamentar' | 'Cooperação' | 'Privada'
export type StatusProcessoContratacao = 'Planejamento' | 'Em instrução' | 'Contratado' | 'Pago' | 'Entregue'
export type StatusItemPlano = 'Autorizado' | 'Em ajuste' | 'Contratado' | 'Executado' | 'Cancelado'
export type CategoriaItem = 'Equipamento' | 'Obra' | 'Serviço' | 'Material permanente' | 'Custeio'
export type NaturezaAquisicao = 'Licitação' | 'Dispensa' | 'Inexigibilidade' | 'Ata de registro' | 'Execução direta'
export type Banco = 'Banco do Brasil' | 'Caixa Econômica Federal' | 'Bradesco' | 'Itaú' | 'Santander'
export type NaturezaDespesa = '339030' | '339039' | '449052' | '449051' | '335041'
export type SituacaoRepasseSeap = 'Não iniciado' | 'Parcial' | 'Integral' | 'Pendente' | 'Bloqueado'
export type PrestacaoStatus = 'Não iniciada' | 'Em elaboração' | 'Enviada' | 'Em análise' | 'Aprovada' | 'Diligenciada'
export type PrestacaoEspecie = 'Parcial' | 'Final' | 'Complementar'
export type StatusAnalise = 'Aguardando análise' | 'Em análise técnica' | 'Com diligência' | 'Aprovada' | 'Reprovada'

export interface AuditFields {
  id: string
  createdAt: string
  updatedAt: string
}

export interface Instrumento extends AuditFields {
  numeroInternoSeap: string
  alertas: string[]
  status: InstrumentoStatus
  prazoFinalClausulaSuspensiva: string
  dataFinalClausulaSuspensiva: string
  modalidade: Modalidade
  normativo: string
  tipo: InstrumentoTipo
  numero: string
  anoFormalizacao: number
  prazoValidade: string
  vigenciaInicial: string
  vigenciaFinal: string
  uploadTermo?: DocumentoReferencia
  repasseFinanceiro: SimNao
}

export interface InstrumentoFinanceiro extends AuditFields {
  instrumentoId: string
  banco: Banco
  contaBancaria: string
  naturezaDespesa: NaturezaDespesa
  valorGlobal: number
  repasseParticipe: number
  repasseSeap: number
  situacaoRepasseSeap: SituacaoRepasseSeap
  saldoConta: number
  dataAtualizacaoSaldoConta: string
  saldoEconomicidade: number
  rendimentoAplicacaoExistente: number
  rendimentoAplicacaoAutorizado: number
  recursoExecutado: number
  publicacaoDoeSitePncp: string
}

export interface InstrumentoGestao extends AuditFields {
  instrumentoId: string
  fiscalInstrumento: string
  portariaSei: string
  substatus: string
  prorrogacao: SimNao
}

export interface DocumentoReferencia {
  nome: string
  seiNumero?: string
  url?: string
}

export interface PlanoItem extends AuditFields {
  instrumentoId: string
  eixo: string
  penaJustaEixo: string
  penaJustaIndicadorUf: string
  planoEstrategicoObjetivos: string
  setorCorrelacionado: string
  categoriaItem: CategoriaItem
  descricao: string
  codigoNaturezaDespesa: NaturezaDespesa
  naturezaAquisicao: NaturezaAquisicao
  quantidade: number
  unidadeMedida: string
  valorUnitarioAutorizado: number
  frutoAjuste: SimNao
  documentoAutorizacao: DocumentoReferencia
  monitorado: SimNao
  statusItem: StatusItemPlano
  acaoAjuste: string
  saldoRendimento: number
}

export interface PlanoAjuste extends AuditFields {
  instrumentoId: string
  status: string
  documentoSolicitacaoSei: string
  documentoAutorizacaoSei: string
  novoPeriodoAutorizado: string
  uploadTermoAditivo?: DocumentoReferencia
  historicoMudancas: string
}

export interface PlanoSaldoRendimento extends AuditFields {
  instrumentoId: string
  status: string
  documentoSolicitacaoSei: string
  documentoAutorizacaoSei: string
  uploadDocumentoAutorizador?: DocumentoReferencia
  valorAutorizado: number
}

export type PlanoSuplementacao = PlanoSaldoRendimento

export interface Contratacao extends AuditFields {
  instrumentoId: string
  processoSei: string
  statusProcesso: StatusProcessoContratacao
  transferegovProcesso: SimNao
  neNumero: string
  neData: string
  neValor: number
  neFonte: string
  neSei: string
  contratoNumero: string
  contratoSei: string
  transferegovContrato: SimNao
  valorUnitarioContratado: number
  valorTotalContratado: number
  quantidadeContratada: number
  enteContratado: string
  cnpjContratado: string
  gestor: string
  portariaGestorSei: string
  fiscal: string
  portariaFiscalSei: string
  notaFiscalNumero: string
  notaFiscalSei: string
  informacaoGestorSei: string
  termoRecebimentoProvisorioSei: string
  termoRecebimentoDefinitivoSei: string
  obNumero: string
  obData: string
  obValor: number
  obFonte: string
  obSei: string
  tomboNumero: string
  guiaTombamentoSei: string
  fotoSei: string
  transferegovEntrega: SimNao
  termoEntregaSei: string
  relatorioBeneficiados: string
  localizacao: string
  unidadeBeneficiada: string
}

export interface ContratacaoItem extends AuditFields {
  instrumentoId: string
  contratacaoId: string
  planoItemId: string
  quantidadeVinculada: number
  valorVinculado: number
}

export interface PrestacaoConta extends AuditFields {
  instrumentoId: string
  status: PrestacaoStatus
  especie: PrestacaoEspecie
  periodo: string
  relatorioSei: string
  uploadRelatorio?: DocumentoReferencia
  documentoEnvioSei: string
  complementacao: string
  documentoRespostaSei: string
}

export interface PrestacaoAnalise extends AuditFields {
  instrumentoId: string
  prestacaoContaId: string
  analise: string
  areaTecnica: string
  documentoAnaliseSei: string
  statusAnalise: StatusAnalise
  documentoAnalisePosteriorSei: string
}

export interface HistoricoEvento extends AuditFields {
  instrumentoId: string
  data: string
  titulo: string
  descricao: string
  responsavel: string
}

export interface Database {
  instrumentos: Instrumento[]
  instrumentoFinanceiros: InstrumentoFinanceiro[]
  instrumentoGestoes: InstrumentoGestao[]
  planoItens: PlanoItem[]
  planoAjustes: PlanoAjuste[]
  planoSaldosRendimento: PlanoSaldoRendimento[]
  planoSuplementacoes: PlanoSuplementacao[]
  contratacoes: Contratacao[]
  contratacaoItens: ContratacaoItem[]
  prestacoesConta: PrestacaoConta[]
  prestacaoAnalises: PrestacaoAnalise[]
  historicoEventos: HistoricoEvento[]
}

export type CreateInput<T extends AuditFields> = Omit<T, keyof AuditFields>
export type UpdateInput<T extends AuditFields> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>
