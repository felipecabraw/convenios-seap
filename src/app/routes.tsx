export type ModuleKey =
  | 'dashboard'
  | 'instrumentos'
  | 'plano'
  | 'execucao'
  | 'prestacao'
  | 'configuracoes'

export type InstrumentosTab = 'overview' | 'dados' | 'financeiro' | 'gestao' | 'historico'
export type InstrumentosMode = 'detail' | 'create'
export type PlanoTab = 'itens' | 'ajustes' | 'rendimento' | 'suplementacao' | 'historico'

export interface AppRoute {
  module: ModuleKey
  instrumentosMode?: InstrumentosMode
  instrumentosTab?: InstrumentosTab
  planoTab?: PlanoTab
}

export const initialRoute: AppRoute = { module: 'dashboard' }
