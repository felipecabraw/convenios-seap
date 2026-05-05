import type {
  Banco,
  CategoriaItem,
  InstrumentoStatus,
  InstrumentoTipo,
  Modalidade,
  NaturezaAquisicao,
  NaturezaDespesa,
  PrestacaoEspecie,
  PrestacaoStatus,
  SimNao,
  SituacaoRepasseSeap,
  StatusAnalise,
  StatusItemPlano,
  StatusProcessoContratacao,
} from '../data/database.types'

export const simNaoOptions: SimNao[] = ['Sim', 'Não']
export const instrumentoTipos: InstrumentoTipo[] = ['Fundo a Fundo obrigatório', 'Fundo a Fundo voluntário', 'Convênio', 'Contrato de Repasse', 'Emenda Parlamentar Estadual', 'Emenda Parlamentar Federal', 'Penas Pecuniárias', 'Termo de Colaboração', 'Termo de Fomento', 'Acordo de Cooperação Técnico', 'Parceria com entidade privada']
export const instrumentoStatusOptions: InstrumentoStatus[] = ['Em elaboração', 'Vigente', 'Cláusula suspensiva', 'Em execução', 'Prestação de contas', 'Concluído', 'Suspenso']
export const modalidadeOptions: Modalidade[] = ['Obrigatória', 'Voluntária', 'Parlamentar', 'Cooperação', 'Privada']
export const statusProcessoContratacaoOptions: StatusProcessoContratacao[] = ['Planejamento', 'Em instrução', 'Contratado', 'Pago', 'Entregue']
export const statusItemPlanoOptions: StatusItemPlano[] = ['Autorizado', 'Em ajuste', 'Contratado', 'Executado', 'Cancelado']
export const categoriaItemOptions: CategoriaItem[] = ['Equipamento', 'Obra', 'Serviço', 'Material permanente', 'Custeio']
export const naturezaAquisicaoOptions: NaturezaAquisicao[] = ['Licitação', 'Dispensa', 'Inexigibilidade', 'Ata de registro', 'Execução direta']
export const bancoOptions: Banco[] = ['Banco do Brasil', 'Caixa Econômica Federal', 'Bradesco', 'Itaú', 'Santander']
export const naturezaDespesaOptions: NaturezaDespesa[] = ['339030', '339039', '449052', '449051', '335041']
export const situacaoRepasseSeapOptions: SituacaoRepasseSeap[] = ['Não iniciado', 'Parcial', 'Integral', 'Pendente', 'Bloqueado']
export const prestacaoStatusOptions: PrestacaoStatus[] = ['Não iniciada', 'Em elaboração', 'Enviada', 'Em análise', 'Aprovada', 'Diligenciada']
export const prestacaoEspecieOptions: PrestacaoEspecie[] = ['Parcial', 'Final', 'Complementar']
export const statusAnaliseOptions: StatusAnalise[] = ['Aguardando análise', 'Em análise técnica', 'Com diligência', 'Aprovada', 'Reprovada']
