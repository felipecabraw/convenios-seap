export type ViewKey = 'dados' | 'plano' | 'contratacao' | 'gestao' | 'ajustes' | 'prestacao';

export type SidebarItem = {
  key: 'painel' | 'novo-processo' | 'processos' | 'relatorios' | 'configuracoes';
  label: string;
  icon: string;
  target: ViewKey;
  action?: 'navigate' | 'openCadastro';
};

export const sidebarItems: SidebarItem[] = [
  { key: 'painel', label: 'Painel Gerencial', icon: 'dashboard', target: 'gestao', action: 'navigate' },
  { key: 'novo-processo', label: 'Novo Processo', icon: 'note_add', target: 'dados', action: 'openCadastro' },
  { key: 'processos', label: 'Processos', icon: 'description', target: 'dados' },
  { key: 'relatorios', label: 'Prestação de Contas', icon: 'receipt_long', target: 'prestacao' },
  { key: 'configuracoes', label: 'Configurações', icon: 'settings', target: 'ajustes' },
];
