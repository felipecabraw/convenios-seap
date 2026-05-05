import type { PrestacaoItemForm } from './cadastro';
import type { ProcessosRecord } from './processos-db';

export type PrestacaoChecklistEntry = {
  title: string;
  status: 'Enviado' | 'Parcial' | 'Pendência';
  tone: 'success' | 'warning' | 'danger';
};

export function buildPrestacaoChecklistEntries(record: ProcessosRecord | null, items: PrestacaoItemForm[]): PrestacaoChecklistEntry[] {
  const prestacao = record?.cadastro.prestacaoContas;
  const any = (predicate: (item: PrestacaoItemForm) => boolean) => items.some(predicate);
  const all = (predicate: (item: PrestacaoItemForm) => boolean) => items.length > 0 && items.every(predicate);
  const statusFrom = (complete: boolean, partial: boolean) =>
    complete ? ({ status: 'Enviado', tone: 'success' } as const) : partial ? ({ status: 'Parcial', tone: 'warning' } as const) : ({ status: 'Pendência', tone: 'danger' } as const);

  return [
    { title: 'Relatório de Execução do Objeto', ...statusFrom(any((item) => Boolean(item.relatorioExecucaoItem)), any((item) => Boolean(item.relatorioExecucaoItem))) },
    { title: 'Relatório de Execução Financeira', ...statusFrom(Boolean(prestacao?.valorGlobalExecutado || any((item) => parsePlanMoney(item.valorExecutadoItem) > 0)), any((item) => parsePlanMoney(item.valorExecutadoItem) > 0)) },
    { title: 'Comprovantes de Despesas', ...statusFrom(all((item) => Boolean(item.notaFiscalItem || item.reciboItem)), any((item) => Boolean(item.notaFiscalItem || item.reciboItem))) },
    { title: 'Extratos Bancários', ...statusFrom(any((item) => Boolean(item.extratoItem)), any((item) => Boolean(item.extratoItem))) },
    { title: 'Conciliação Bancária', ...statusFrom(Boolean(record?.cadastro.dadosGerais.saldoConta), any((item) => Boolean(item.ordemBancariaItem))) },
    { title: 'Notas e Comprovantes Fiscais', ...statusFrom(all((item) => Boolean(item.notaFiscalItem)), any((item) => Boolean(item.notaFiscalItem))) },
    { title: 'Declaração de Guarda de Documentos', ...statusFrom(Boolean(prestacao?.observacoesFinais), false) },
    { title: 'Parecer do Controle Interno', ...statusFrom(any((item) => Boolean(item.parecerItem)), any((item) => Boolean(item.parecerItem))) },
  ];
}

export function prestacaoRowTone(status: string, percentual: number, item: PrestacaoItemForm) {
  const normalized = status.toLowerCase();
  const hasDocs = Boolean(item.notaFiscalItem || item.reciboItem || item.relatorioExecucaoItem);
  if (normalized.includes('comprov') || normalized.includes('encerr') || (percentual >= 70 && hasDocs)) return 'success';
  if (normalized.includes('pend') || percentual === 0) return 'danger';
  return 'warning';
}

export function prestacaoRowLabel(tone: 'success' | 'warning' | 'danger') {
  if (tone === 'success') return 'Em dia';
  if (tone === 'warning') return 'Atenção';
  return 'Pendente';
}

export function buildPrestacaoDocumentSummary(checklist: PrestacaoChecklistEntry[]) {
  const grouped = [
    { label: 'Relatórios', required: 3, items: checklist.slice(0, 2) },
    { label: 'Comprovantes de Despesas', required: 8, items: checklist.slice(2, 3) },
    { label: 'Extratos e Conciliações', required: 4, items: checklist.slice(3, 5) },
    { label: 'Declarações e Pareceres', required: 5, items: checklist.slice(6, 8) },
    { label: 'Outros Documentos', required: 4, items: checklist.slice(5, 6) },
  ];

  return grouped.map((group) => {
    const score = group.items.reduce((sum, item) => sum + (item.status === 'Enviado' ? 1 : item.status === 'Parcial' ? 0.5 : 0), 0);
    const sent = Math.min(group.required, Math.max(0, Math.round((score / Math.max(group.items.length, 1)) * group.required)));
    const tone = group.items.some((item) => item.tone === 'danger')
      ? 'danger'
      : group.items.some((item) => item.tone === 'warning')
        ? 'warning'
        : 'success';
    return {
      label: group.label,
      required: group.required,
      sent,
      tone,
      status: tone === 'success' ? 'Concluído' : tone === 'warning' ? 'Parcial' : 'Pendência',
    };
  });
}

export function buildPrestacaoPendings(checklist: PrestacaoChecklistEntry[], items: PrestacaoItemForm[]) {
  const base = checklist
    .filter((item) => item.tone !== 'success')
    .slice(0, 3)
    .map((item, index) => ({
      title: item.title,
      detail: item.status === 'Parcial' ? 'Documentação incompleta' : `${Math.max(1, items.filter((entry) => !entry.notaFiscalItem && !entry.reciboItem).length)} documento(s) pendente(s)`,
      deadline: `${[12, 9, 7][index] ?? 5} dias`,
    }));

  return base.length
    ? base
    : [{ title: 'Sem pendências críticas', detail: 'Documentação principal em conformidade', deadline: 'No prazo' }];
}

export function buildPrestacaoProgressLegend(
  items: Array<{ tone: 'success' | 'warning' | 'danger'; percentual: number }>,
  pendingDocuments: number,
) {
  const success = items.filter((item) => item.tone === 'success').length;
  const warning = items.filter((item) => item.tone === 'warning').length;
  const danger = Math.max(items.filter((item) => item.tone === 'danger').length, pendingDocuments ? 1 : 0);
  const total = Math.max(success + warning + danger, 1);
  const successPercent = Math.round((success / total) * 100);
  const warningPercent = Math.round((warning / total) * 100);
  const dangerPercent = Math.max(0, 100 - successPercent - warningPercent);
  return [
    { label: 'Concluído', percent: successPercent, tone: 'success' as const },
    { label: 'Em andamento', percent: warningPercent, tone: 'warning' as const },
    { label: 'Pendências', percent: dangerPercent, tone: 'danger' as const },
  ];
}

export function buildPrestacaoProgressDonut(items: Array<{ percent: number; tone: 'success' | 'warning' | 'danger' }>) {
  const colors = { success: '#67c26f', warning: '#f4b63c', danger: '#e45b5b' };
  let cursor = 0;
  return items
    .map((item, index) => {
      const start = cursor;
      const end = index === items.length - 1 ? 100 : cursor + item.percent;
      cursor = end;
      return `${colors[item.tone]} ${start}% ${end}%`;
    })
    .join(', ');
}

function parsePlanMoney(value: string) {
  const normalized = value.replace(/[^0-9,-]/g, '').replace(/\./g, '').replace(',', '.');
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : 0;
}
