export type ViewKey = 'dados' | 'plano' | 'financeiro' | 'contratacao' | 'gestao' | 'ajustes' | 'prestacao';

export type SidebarItem = {
  key: 'painel' | 'processos' | 'relatorios';
  label: string;
  icon: string;
  target: ViewKey;
  action?: 'navigate';
};

export const sidebarItems: SidebarItem[] = [
  { key: 'painel', label: 'Painel Gerencial', icon: 'space_dashboard', target: 'gestao', action: 'navigate' },
  { key: 'processos', label: 'Processos', icon: 'folder_open', target: 'dados', action: 'navigate' },
  { key: 'relatorios', label: 'Prestacao de Contas', icon: 'summarize', target: 'prestacao', action: 'navigate' },
];
