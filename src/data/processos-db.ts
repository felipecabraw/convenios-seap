import {
  CadastroInstrumentoFormData,
  ContratacaoItemVinculado,
  cadastroInitialFormData,
  PlanoItemForm,
  PrestacaoItemForm,
  ProcessoContratacaoForm,
  ProcessoContratacaoRegistro,
  createPrestacaoItemFromPlanoItem,
} from './cadastro';

export type ProcessosRecordTone = 'neutral' | 'secondary' | 'info' | 'primary' | 'warning' | 'success' | 'danger' | 'violet' | 'cyan' | 'rose';
export type DashboardTone = 'primary' | 'secondary' | 'danger';
export type DeadlineTone = 'critical' | 'warning' | 'success';

export type ProcessosRecord = { id: string; createdAt: string; updatedAt: string; cadastro: CadastroInstrumentoFormData };
export type ProcessosDatabase = { records: ProcessosRecord[]; selectedRecordId: string; lastSyncAt: string };
type DeepPartial<T> = { [K in keyof T]?: T[K] extends Array<infer U> ? Array<DeepPartial<U>> : T[K] extends object ? DeepPartial<T[K]> : T[K] };
export type ProcessoConsolidatedSummary = {
  valorTotalAutorizado: number;
  valorTotalContratado: number;
  saldoDisponivel: number;
  valorTotalPago: number;
  saldoExecutar: number;
  percentualContratado: number;
  percentualExecutado: number;
  totalItensPlano: number;
  totalContratacoes: number;
};

export type InventoryRow = { id: string; ref: string; title: string; subtitle: string; status: string; statusTone: ProcessosRecordTone; due: string; amount: string; progress: number };
export type SummaryMetric = { label: string; value: string; hint: string; tone: DashboardTone; icon: string };
export type InventoryDeadlineItem = { title: string; due: string; tone: 'danger' | 'warning' };
export type DeadlineRow = { id: string; object: string; amount: string; vigency: string; deadline: string; deadlineLabel: string; deadlineDays: number | null; status: string; tone: DeadlineTone };
export type DashboardBar = { label: string; expected: number; executed: number };
export type DistributionSlice = { label: string; value: number; color: string };
export type ChecklistItem = { title: string; subtitle: string; tone: 'success' | 'warning' | 'neutral' };
export type AuditEvent = { title: string; description: string; date: string; tone: 'critical' | 'success' | 'neutral' };
export type ContractPartyRow = { institution: string; cnpj: string; role: string; representative: string };
export type DashboardAlertRow = { title: string; detail: string; tone: DeadlineTone; meta: string };
export type DashboardRecentRow = { id: string; ref: string; title: string; subtitle: string; sector: string; status: string; statusTone: ProcessosRecordTone; vigency: string; amount: string; progress: number; alert: string };

const STORAGE_KEY = 'convenios-seap:processos-db:v1';

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function parseMoney(value: string) {
  if (!value) return 0;
  const parsed = Number(value.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
  return Number.isNaN(parsed) ? 0 : parsed;
}
function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
function formatPercent(value: number) {
  return `${value.toFixed(1).replace('.', ',')}%`;
}
function formatDate(date: string) {
  if (!date) return 'A definir';
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat('pt-BR').format(parsed);
}
function diffDays(date: string) {
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.ceil((parsed.getTime() - start.getTime()) / 86400000);
}
function monthLabel(date: Date) {
  return ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][date.getMonth()] ?? 'JAN';
}
function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function repairLegacyText(value: string) {
  const replacements: Array<[string, string]> = [
    ['\u00c3\u00a1', 'á'],
    ['\u00c3\u00a2', 'â'],
    ['\u00c3\u00a3', 'ã'],
    ['\u00c3\u00a4', 'ä'],
    ['\u00c3\u00a7', 'ç'],
    ['\u00c3\u00a9', 'é'],
    ['\u00c3\u00aa', 'ê'],
    ['\u00c3\u00ad', 'í'],
    ['\u00c3\u00b3', 'ó'],
    ['\u00c3\u00b4', 'ô'],
    ['\u00c3\u00b5', 'õ'],
    ['\u00c3\u00ba', 'ú'],
    ['\u00c3\u0089', 'É'],
    ['\u00c3\u008a', 'Ê'],
    ['\u00c3\u008d', 'Í'],
    ['\u00c3\u0093', 'Ó'],
    ['\u00c3\u0094', 'Ô'],
    ['\u00c3\u0095', 'Õ'],
    ['\u00c3\u009a', 'Ú'],
    ['\u00c3\u0087', 'Ç'],
    ['\u00c2\u00ba', 'º'],
    ['\u00c2\u00aa', 'ª'],
    ['\u00c2\u00b0', '°'],
    ['\u00c2\u00b7', '·'],
    ['\u00c2\u00a0', ' '],
  ];

  const unknown = '\u003f';
  let repaired = value
    .replaceAll(`Discricion${unknown}ria`, 'Discricionária')
    .replaceAll(`Obrigat${unknown}ria`, 'Obrigatória')
    .replaceAll(`Conv${unknown}nio`, 'Convênio')
    .replaceAll(`N${unknown}o`, 'Não')
    .replaceAll(`execu${unknown}${unknown}o`, 'execução')
    .replaceAll(`Execu${unknown}${unknown}o`, 'Execução')
    .replaceAll(`Gest${unknown}o`, 'Gestão')
    .replaceAll(`gest${unknown}o`, 'gestão')
    .replaceAll(`Cl${unknown}usula`, 'Cláusula')
    .replaceAll(`Prorroga${unknown}${unknown}o`, 'Prorrogação')
    .replaceAll(`presta${unknown}${unknown}o`, 'prestação')
    .replaceAll(`Presta${unknown}${unknown}o`, 'Prestação')
    .replaceAll(`descri${unknown}${unknown}o`, 'descrição')
    .replaceAll(`vig${unknown}ncia`, 'vigência')
    .replaceAll(`Vig${unknown}ncia`, 'Vigência')
    .replaceAll(`an${unknown}lise`, 'análise')
    .replaceAll(`Aten${unknown}${unknown}o`, 'Atenção')
    .replaceAll(`Situa${unknown}${unknown}o`, 'Situação')
    .replaceAll(`Fiscaliza${unknown}${unknown}o`, 'Fiscalização')
    .replaceAll(`Atualiza${unknown}${unknown}o`, 'Atualização')
    .replaceAll(`Mossor${unknown}`, 'Mossoró');

  for (const [from, to] of replacements) {
    repaired = repaired.replaceAll(from, to);
  }

  return repaired;
}

function repairLegacyStrings<T>(value: T): T {
  if (typeof value === 'string') return repairLegacyText(value) as T;
  if (Array.isArray(value)) return value.map((item) => repairLegacyStrings(item)) as T;
  if (!isPlainObject(value)) return value;

  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, repairLegacyStrings(entry)])) as T;
}
export function statusTone(status: string): ProcessosRecordTone {
  const normalized = normalizeText(status);
  if (!normalized) return 'neutral';
  if (normalized.includes('glos') || normalized.includes('reprov') || normalized.includes('parad') || normalized.includes('susp')) return 'danger';
  if (normalized.includes('concl') || normalized.includes('aprov') || normalized.includes('vigente')) return 'success';
  if (normalized.includes('prorrog') || normalized.includes('suplement')) return 'violet';
  if (normalized.includes('rendimento')) return 'cyan';
  if (normalized.includes('prest')) return 'rose';
  if (normalized.includes('ajuste')) return 'info';
  if (normalized.includes('formaliz')) return 'primary';
  if (normalized.includes('anal') || normalized.includes('pend') || normalized.includes('solicit') || normalized.includes('claus')) return 'warning';
  if (normalized.includes('execu') || normalized.includes('andamento')) return 'info';
  if (normalized.includes('arquiv')) return 'secondary';
  return 'secondary';
}
function deadlineTone(days: number | null): DeadlineTone {
  if (days === null) return 'warning';
  if (days <= 45) return 'critical';
  if (days <= 120) return 'warning';
  return 'success';
}
function deadlineValue(record: ProcessosRecord) {
  return diffDays(record.cadastro.dadosGerais.vigenciaFinal || record.cadastro.dadosGerais.prazoValidade || '');
}
function isInstrumentActive(record: ProcessosRecord) {
  const status = normalizeText(record.cadastro.dadosGerais.status || record.cadastro.processoContratacao.statusProcesso || '');
  return status.includes('vigente') || status.includes('execu') || status.includes('andamento') || status.includes('acompanh');
}
function isSuspensiveClause(record: ProcessosRecord) {
  return Boolean(record.cadastro.dadosGerais.prazoFinalClausulaSuspensiva) || normalizeText(record.cadastro.gestaoInstrumento.substatus || '').includes('suspensiva');
}
function dashboardRiskTone(record: ProcessosRecord): DeadlineTone {
  return isSuspensiveClause(record) ? 'critical' : deadlineTone(deadlineValue(record));
}
function currentProgress(record: ProcessosRecord) {
  const dados = record.cadastro.dadosGerais;
  const summary = buildProcessoConsolidatedSummary(record);
  const explicit = parseMoney(dados.percentualExecutado || '');
  if (summary.percentualExecutado > 0) return summary.percentualExecutado;
  if (explicit > 0 && explicit <= 100) return explicit;
  return 0;
}

function createLegacyContractItem(record: ProcessoContratacaoForm, planoItems: PlanoItemForm[]): ContratacaoItemVinculado[] {
  if (!planoItems.length) return [];
  const totalContratado = parseMoney(record.valorTotalContratado);
  const fallbackTotal = totalContratado > 0 ? totalContratado / planoItems.length : 0;
  return planoItems.map((item) => ({
    id: `legacy-link-${item.id}`,
    planoItemId: item.id,
    itemDescricao: item.item,
    quantidadeContratada: item.quantidade || record.quantidadeContratada || '1',
    valorUnitarioContratado: item.valorUnitarioAutorizado || record.valorUnitarioContratado,
    valorTotalContratado: item.valorTotalAutorizado || (fallbackTotal ? formatCurrency(fallbackTotal) : record.valorTotalContratado),
  }));
}

function normalizeContratacaoRegistros(
  registros: DeepPartial<ProcessoContratacaoRegistro>[] | undefined,
  legacyDraft: ProcessoContratacaoForm,
  planoItems: PlanoItemForm[],
): ProcessoContratacaoRegistro[] {
  const normalized = Array.isArray(registros)
    ? registros.map((registro, index) => ({
        ...legacyDraft,
        ...(registro as ProcessoContratacaoRegistro),
        id: typeof registro.id === 'string' && registro.id ? registro.id : `contratacao-${index + 1}`,
        itensVinculados: Array.isArray(registro.itensVinculados)
          ? (registro.itensVinculados as ContratacaoItemVinculado[])
          : createLegacyContractItem({ ...legacyDraft, ...(registro as ProcessoContratacaoForm) }, planoItems),
      }))
    : [];

  if (normalized.length) return normalized;

  const hasLegacyContract = Boolean(
    legacyDraft.processoSei ||
      legacyDraft.contratoNumero ||
      legacyDraft.enteContratado ||
      legacyDraft.valorTotalContratado ||
      legacyDraft.obValor,
  );

  return hasLegacyContract
    ? [
        {
          ...legacyDraft,
          id: 'contratacao-legado-1',
          itensVinculados: createLegacyContractItem(legacyDraft, planoItems),
        },
      ]
    : [];
}

function cloneFormData(overrides?: DeepPartial<CadastroInstrumentoFormData>): CadastroInstrumentoFormData {
  const cloned = JSON.parse(JSON.stringify(cadastroInitialFormData)) as CadastroInstrumentoFormData;
  if (!overrides) return cloned;
  const planoItens = (overrides.planoTrabalho?.itens ?? cloned.planoTrabalho.itens) as PlanoItemForm[];
  const prestacaoItens = (overrides.prestacaoContas?.itens ?? cloned.prestacaoContas.itens) as PrestacaoItemForm[];
  const legacyDraft = { ...cloned.processoContratacao, ...(overrides.processoContratacao ?? {}) } as ProcessoContratacaoForm;
  const processoContratacaoRegistros = normalizeContratacaoRegistros(
    overrides.processoContratacaoRegistros as DeepPartial<ProcessoContratacaoRegistro>[] | undefined,
    legacyDraft,
    planoItens,
  );

  return repairLegacyStrings({
    ...cloned,
    dadosGerais: { ...cloned.dadosGerais, ...(overrides.dadosGerais ?? {}) },
    planoTrabalho: { ...cloned.planoTrabalho, ...(overrides.planoTrabalho ?? {}), itens: planoItens.map((item) => ({ ...item })) },
    processoContratacao: legacyDraft,
    processoContratacaoRegistros,
    gestaoInstrumento: { ...cloned.gestaoInstrumento, ...(overrides.gestaoInstrumento ?? {}) },
    ajustePt: { ...cloned.ajustePt, ...(overrides.ajustePt ?? {}) },
    documentos: { ...cloned.documentos, ...(overrides.documentos ?? {}) },
    filtros: { ...cloned.filtros, ...(overrides.filtros ?? {}) },
    prestacaoContas: { ...cloned.prestacaoContas, ...(overrides.prestacaoContas ?? {}), itens: syncPrestacaoItems(planoItens, prestacaoItens) },
  });
}

function syncPrestacaoItems(planoItems: PlanoItemForm[], prestacaoItems: PrestacaoItemForm[]) {
  const currentById = new Map(prestacaoItems.map((item) => [item.itemPlanoId, item]));
  return planoItems.map((item) => {
    const existing = currentById.get(item.id);
    const base = createPrestacaoItemFromPlanoItem(item);
    return existing ? { ...base, ...existing, itemPlanoId: item.id, itemPlanoDescricao: item.item, categoriaItemObjeto: item.categoriaItemObjeto, quantidadePrevista: item.quantidade, valorUnitarioPrevisto: item.valorUnitarioAutorizado, valorTotalPrevisto: item.valorTotalAutorizado } : base;
  });
}

function buildSeedRecord(id: string, createdAt: string, updatedAt: string, overrides: DeepPartial<CadastroInstrumentoFormData>): ProcessosRecord {
  return { id, createdAt, updatedAt, cadastro: cloneFormData(overrides) };
}

function seedDatabase(): ProcessosDatabase {
  const records = [
    buildSeedRecord('proc-conv-2022', '2024-01-18T12:00:00.000Z', '2024-04-12T12:00:00.000Z', {
      dadosGerais: { numeroInternoSeap: 'CONV 894231/2022', status: 'Vigente', modalidade: 'Discricionária', eixo: 'Aparelhamento do SISPERN', setorCorrelacionado: 'Gabinete de Gestão', instrumento: 'Convênio', numeroInstrumento: '894231/2022', anoFormalizacao: '2022', prazoValidade: '2024-06-30', vigenciaInicial: '2022-07-01', vigenciaFinal: '2024-06-30', prorrogacao: 'Vigente - Prorrogado', banco: 'Brasil', contaBancaria: '12045-8', naturezaDespesa: 'Capital', valorGlobal: 'R$ 4.250.000,00', repasseParticipe: 'R$ 4.000.000,00', repasseSeap: 'R$ 250.000,00', situacaoRepasseSeap: 'Integralizado', saldoConta: 'R$ 1.180.000,00', dataAtualizacaoSaldoConta: '2024-04-12', saldoEconomicidade: 'R$ 430.000,00', rendimentoAplicacaoExistente: 'R$ 18.400,00', rendimentoAplicacaoAutorizado: 'R$ 24.000,00', recursoExecutado: 'R$ 2.870.000,00', percentualExecutado: '67,5%', prazoFinalClausulaSuspensiva: '', diasRestanteClausulaSuspensiva: '', diasRestantes: '' },
      planoTrabalho: { itens: [{ id: 'conv-1', categoriaItemObjeto: 'Infraestrutura', item: 'Reforma e ampliação do pavilhão de segurança', quantidade: '1', unidadeMedida: 'Obra', valorUnitarioAutorizado: 'R$ 4.250.000,00', valorTotalAutorizado: 'R$ 4.250.000,00', frutoDeAjuste: 'Não', documentoAutorizacao: 'OF-PT-001/2024', monitorado: 'Sim' }] },
      processoContratacao: { processoSei: '00001.123456/2024-11', statusProcesso: 'Em andamento', transferegovProcesso: 'Sim', neNumero: 'NE-2024-001', neData: '2024-02-05', neValor: 'R$ 4.250.000,00', neFonte: 'Tesouro Estadual', neSei: 'NE-SEI-001', contratoNumero: 'CT-001/2024', contratoSei: 'CT-SEI-001', transferegovContrato: 'Sim', valorUnitarioContratado: 'R$ 4.250.000,00', valorTotalContratado: 'R$ 4.250.000,00', quantidadeContratada: '1', enteContratado: 'Construtora Rio Forte LTDA', cnpjContratado: '12.345.678/0001-90', gestor: 'Carlos Oliveira', portariaGestorSei: 'PORT-001/2024', fiscal: 'Mariana Lima', portariaFiscalSei: 'PORT-002/2024', notaFiscalNumero: 'NF-221', notaFiscalSei: 'NF-SEI-221', informacaoGestorSei: 'INFO-001', termoRecebimentoProvisorioSei: 'TRP-001', termoRecebimentoDefinitivoSei: 'TRD-001', obNumero: 'OB-2024-111', obData: '2024-03-28', obValor: 'R$ 2.870.000,00', obFonte: 'Tesouro Estadual', obSei: 'OB-SEI-111', tomboNumero: 'TB-881', guiaTombamentoSei: 'GT-SEI-881', fotoSei: 'FOTO-SEI-881', transferegovEntrega: 'Sim', termoEntregaSei: 'TE-SEI-881', relatorioBeneficiados: 'SEAP - Secretaria de Estado da Administração Penitenciária', localizacao: 'CPN - Cadeia Pública de Natal', unidadeBeneficiada: 'SEAP/GSI - Gabinete de Segurança Institucional' } as unknown as ProcessoContratacaoForm,
      gestaoInstrumento: { substatus: 'Acompanhamento regular', oficioSei: 'OF-GEST-001' },
    }),
    buildSeedRecord('proc-plano-2026', '2026-02-07T12:00:00.000Z', '2026-02-24T12:00:00.000Z', {
      dadosGerais: { numeroInternoSeap: 'PLANO 034/2026', status: 'Em execução', modalidade: 'Obrigatória', eixo: 'Sistema de monitoramento', setorCorrelacionado: 'Coordenação de Logística', instrumento: 'Plano de Trabalho', numeroInstrumento: '034/2026', anoFormalizacao: '2026', prazoValidade: '2026-09-15', vigenciaInicial: '2026-02-01', vigenciaFinal: '2026-09-15', prorrogacao: 'Em análise', banco: 'Caixa Econômica Federal', contaBancaria: '4467-3', naturezaDespesa: 'Capital', valorGlobal: 'R$ 2.760.000,00', repasseParticipe: 'R$ 2.600.000,00', repasseSeap: 'R$ 160.000,00', situacaoRepasseSeap: 'Em análise', saldoConta: 'R$ 1.140.000,00', dataAtualizacaoSaldoConta: '2026-02-24', saldoEconomicidade: 'R$ 55.000,00', rendimentoAplicacaoExistente: 'R$ 10.200,00', rendimentoAplicacaoAutorizado: 'R$ 15.000,00', recursoExecutado: 'R$ 840.000,00', percentualExecutado: '30,4%', prazoFinalClausulaSuspensiva: '2026-04-30', diasRestanteClausulaSuspensiva: '13', diasRestantes: '' },
      planoTrabalho: { itens: [{ id: 'plano-1', categoriaItemObjeto: 'Tecnologia', item: 'Atualização do parque de monitoramento', quantidade: '1', unidadeMedida: 'Sistema', valorUnitarioAutorizado: 'R$ 2.000.000,00', valorTotalAutorizado: 'R$ 2.000.000,00', frutoDeAjuste: 'Não', documentoAutorizacao: 'OF-PT-028/2026', monitorado: 'Sim' }] },
      processoContratacao: { processoSei: '00005.567890/2026-55', statusProcesso: 'Em andamento', transferegovProcesso: 'Sim', neNumero: 'NE-2026-011', neData: '2026-02-20', neValor: 'R$ 2.760.000,00', neFonte: 'Emenda Federal', neSei: 'NE-SEI-011', contratoNumero: 'CT-011/2026', contratoSei: 'CT-SEI-011', transferegovContrato: 'Sim', valorUnitarioContratado: 'R$ 2.760.000,00', valorTotalContratado: 'R$ 2.760.000,00', quantidadeContratada: '1', enteContratado: 'Monitor Tech Nordeste LTDA', cnpjContratado: '56.789.012/0001-40', gestor: 'Renata Ferreira', portariaGestorSei: 'PORT-028/2026', fiscal: 'Bruno Costa', portariaFiscalSei: 'PORT-029/2026', notaFiscalNumero: 'NF-611', notaFiscalSei: 'NF-SEI-611', informacaoGestorSei: 'INFO-028', termoRecebimentoProvisorioSei: 'TRP-028', termoRecebimentoDefinitivoSei: 'TRD-028', obNumero: 'OB-2026-029', obData: '2026-03-05', obValor: 'R$ 840.000,00', obFonte: 'Emenda Federal', obSei: 'OB-SEI-029', tomboNumero: 'TB-1133', guiaTombamentoSei: 'GT-SEI-1133', fotoSei: 'FOTO-SEI-1133', transferegovEntrega: 'Sim', termoEntregaSei: 'TE-SEI-1133', relatorioBeneficiados: 'SEAP - Secretaria de Estado da Administração Penitenciária', localizacao: 'CPM - Cadeia Pública de Mossoró', unidadeBeneficiada: 'CPM - Cadeia Pública de Mossoró' } as unknown as ProcessoContratacaoForm,
      gestaoInstrumento: { substatus: 'Cláusula suspensiva ativa', oficioSei: 'OF-GEST-028' },
    }),
  ];

  return { records, selectedRecordId: records[0]!.id, lastSyncAt: new Date().toISOString() };
}

function normalizeRecord(input: unknown, fallbackIndex: number): ProcessosRecord | null {
  if (!isPlainObject(input)) return null;
  return { id: typeof input.id === 'string' && input.id.trim() ? input.id : `proc-${fallbackIndex + 1}`, createdAt: typeof input.createdAt === 'string' && input.createdAt ? input.createdAt : new Date().toISOString(), updatedAt: typeof input.updatedAt === 'string' && input.updatedAt ? input.updatedAt : new Date().toISOString(), cadastro: cloneFormData(isPlainObject(input.cadastro) ? (input.cadastro as DeepPartial<CadastroInstrumentoFormData>) : undefined) };
}

function normalizeProcessosDatabase(input: unknown): ProcessosDatabase {
  if (!isPlainObject(input)) return seedDatabase();
  const records = Array.isArray(input.records) ? input.records.map((record, index) => normalizeRecord(record, index)).filter((record): record is ProcessosRecord => Boolean(record)) : [];
  if (!records.length) return seedDatabase();
  const selectedRecordId = typeof input.selectedRecordId === 'string' && records.some((record) => record.id === input.selectedRecordId) ? input.selectedRecordId : records[0]!.id;
  const lastSyncAt = typeof input.lastSyncAt === 'string' && input.lastSyncAt ? input.lastSyncAt : new Date().toISOString();
  return { records, selectedRecordId, lastSyncAt };
}

export function loadProcessosDatabase(): ProcessosDatabase {
  if (!isBrowser()) return seedDatabase();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeProcessosDatabase(JSON.parse(raw)) : seedDatabase();
  } catch {
    return seedDatabase();
  }
}

export function saveProcessosDatabase(database: ProcessosDatabase) {
  if (isBrowser()) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

export function recordTitle(record: ProcessosRecord) {
  return record.cadastro.dadosGerais.numeroInternoSeap || record.cadastro.dadosGerais.instrumento || 'Instrumento sem identificação';
}

export function buildProcessoConsolidatedSummary(record: ProcessosRecord): ProcessoConsolidatedSummary {
  const valorTotalAutorizado = record.cadastro.planoTrabalho.itens.reduce(
    (sum, item) => sum + parseMoney(item.valorTotalAutorizado),
    0,
  );
  const valorTotalContratado = record.cadastro.processoContratacaoRegistros.reduce((sum, contratacao) => {
    const linkedTotal = (contratacao.itensVinculados ?? []).reduce(
      (linkedSum, item) => linkedSum + parseMoney(item.valorTotalContratado),
      0,
    );
    return sum + (linkedTotal > 0 ? linkedTotal : parseMoney(contratacao.valorTotalContratado));
  }, 0);
  const valorTotalPago = record.cadastro.processoContratacaoRegistros.reduce(
    (sum, contratacao) => sum + parseMoney(contratacao.obValor),
    0,
  );
  const saldoDisponivel = Math.max(valorTotalAutorizado - valorTotalContratado, 0);
  const saldoExecutar = Math.max(valorTotalContratado - valorTotalPago, 0);
  const percentualContratado = valorTotalAutorizado > 0 ? Math.min(100, (valorTotalContratado / valorTotalAutorizado) * 100) : 0;
  const percentualExecutado = valorTotalAutorizado > 0 ? Math.min(100, (valorTotalPago / valorTotalAutorizado) * 100) : 0;

  return {
    valorTotalAutorizado,
    valorTotalContratado,
    saldoDisponivel,
    valorTotalPago,
    saldoExecutar,
    percentualContratado: Math.round(percentualContratado * 10) / 10,
    percentualExecutado: Math.round(percentualExecutado * 10) / 10,
    totalItensPlano: record.cadastro.planoTrabalho.itens.length,
    totalContratacoes: record.cadastro.processoContratacaoRegistros.length,
  };
}

export function buildInventoryRows(records: ProcessosRecord[]): InventoryRow[] {
  return records.map((record) => {
    const dados = record.cadastro.dadosGerais;
    const firstContract = record.cadastro.processoContratacaoRegistros[0] ?? record.cadastro.processoContratacao;
    const summary = buildProcessoConsolidatedSummary(record);
    return {
      id: record.id,
      ref: dados.numeroInternoSeap || record.id,
      title: dados.instrumento || 'Instrumento cadastrado',
      subtitle: firstContract.unidadeBeneficiada || firstContract.localizacao || dados.setorCorrelacionado || dados.eixo || 'Cadastro institucional',
      status: dados.status || 'A definir',
      statusTone: statusTone(dados.status || ''),
      due: formatDate(dados.vigenciaFinal || dados.prazoValidade),
      amount: summary.valorTotalAutorizado > 0 ? formatCurrency(summary.valorTotalAutorizado) : dados.valorGlobal || 'A definir',
      progress: summary.percentualContratado || currentProgress(record),
    };
  });
}

export function buildInventoryMetrics(records: ProcessosRecord[]): SummaryMetric[] {
  const total = records.length;
  const active = records.filter(isInstrumentActive).length;
  const avg = total > 0 ? Math.round(records.reduce((sum, record) => sum + currentProgress(record), 0) / total) : 0;
  const critical = records.filter((record) => deadlineTone(deadlineValue(record)) === 'critical').length;
  return [
    { label: 'Total sob gestão', value: String(total), hint: 'Registros cadastrados', tone: 'secondary', icon: 'inventory_2' },
    { label: 'Processos ativos', value: String(active), hint: 'Em vigor ou andamento', tone: 'primary', icon: 'task_alt' },
    { label: 'Execução média', value: `${avg}%`, hint: 'Média dos instrumentos', tone: 'secondary', icon: 'show_chart' },
    { label: 'Alertas críticos', value: String(critical), hint: 'Vigências até 45 dias', tone: 'danger', icon: 'warning' },
  ];
}

export function buildInventoryDeadlines(records: ProcessosRecord[]): InventoryDeadlineItem[] {
  return records
    .map((record) => ({
      title: recordTitle(record),
      due: formatDate(record.cadastro.dadosGerais.vigenciaFinal || record.cadastro.dadosGerais.prazoValidade),
      tone: deadlineTone(deadlineValue(record)) === 'critical' ? ('danger' as const) : ('warning' as const),
    }))
    .slice(0, 4);
}

export function buildDashboardMetrics(records: ProcessosRecord[]): SummaryMetric[] {
  const summaries = records.map(buildProcessoConsolidatedSummary);
  const resources = summaries.reduce((sum, summary) => sum + summary.valorTotalAutorizado, 0);
  const committed = summaries.reduce((sum, summary) => sum + summary.valorTotalContratado, 0);
  const executed = summaries.reduce((sum, summary) => sum + summary.valorTotalPago, 0);
  const avgExecution = records.length > 0 ? Math.round(summaries.reduce((sum, summary) => sum + summary.percentualExecutado, 0) / records.length) : 0;
  const alerts = records.filter((record) => deadlineValue(record) !== null && (deadlineValue(record) ?? 0) <= 120).length;
  return [
    { label: 'Total autorizado', value: formatCurrency(resources), hint: 'Soma do plano aprovado', tone: 'secondary', icon: 'account_balance' },
    { label: 'Contratado', value: formatCurrency(committed), hint: 'Saldo comprometido por contratos', tone: 'primary', icon: 'contract' },
    { label: 'Pago / executado', value: formatCurrency(executed), hint: `${avgExecution}% de execução média`, tone: 'secondary', icon: 'payments' },
    { label: 'Alertas de vigência', value: String(alerts), hint: 'Itens com prazo próximo', tone: 'danger', icon: 'notifications_active' },
  ];
}

export function buildDashboardDeadlines(records: ProcessosRecord[]): DeadlineRow[] {
  return records.map((record) => {
    const days = deadlineValue(record);
    const tone = deadlineTone(days);
    const deadlineLabel = days === null ? 'Prazo indefinido' : tone === 'critical' ? 'Crítico' : tone === 'warning' ? 'Atenção' : 'Regular';
    return {
      id: record.cadastro.dadosGerais.numeroInternoSeap || record.id,
      object: record.cadastro.dadosGerais.eixo || record.cadastro.dadosGerais.instrumento || 'Instrumento cadastrado',
      amount: record.cadastro.dadosGerais.valorGlobal || 'A definir',
      vigency: formatDate(record.cadastro.dadosGerais.vigenciaFinal || record.cadastro.dadosGerais.prazoValidade),
      deadline: days === null ? 'A definir' : `${deadlineLabel} (${Math.abs(days)} dias)`,
      deadlineLabel,
      deadlineDays: days,
      status: record.cadastro.dadosGerais.status || 'A definir',
      tone,
    };
  }).slice(0, 3);
}

export function buildDashboardRecentRows(records: ProcessosRecord[]): DashboardRecentRow[] {
  return [...records].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()).slice(0, 4).map((record) => {
    const days = deadlineValue(record);
    const processo = record.cadastro.processoContratacaoRegistros[0] ?? record.cadastro.processoContratacao;
    const summary = buildProcessoConsolidatedSummary(record);
    return { id: record.id, ref: record.cadastro.dadosGerais.numeroInternoSeap || record.id, title: record.cadastro.dadosGerais.instrumento || 'Instrumento cadastrado', subtitle: processo.unidadeBeneficiada || processo.localizacao || record.cadastro.dadosGerais.setorCorrelacionado || record.cadastro.dadosGerais.eixo || 'Cadastro institucional', sector: processo.unidadeBeneficiada || processo.localizacao || record.cadastro.dadosGerais.setorCorrelacionado || 'Setor não informado', status: record.cadastro.dadosGerais.status || 'A definir', statusTone: statusTone(record.cadastro.dadosGerais.status || ''), vigency: formatDate(record.cadastro.dadosGerais.vigenciaFinal || record.cadastro.dadosGerais.prazoValidade), amount: formatCurrency(summary.valorTotalAutorizado), progress: summary.percentualContratado, alert: days === null ? 'Prazo não informado' : days <= 45 ? `Vence em ${Math.abs(days)} dias` : days <= 120 ? `Atenção em ${Math.abs(days)} dias` : 'Sem alerta imediato' };
  });
}

export function buildDashboardAlerts(records: ProcessosRecord[]): DashboardAlertRow[] {
  return [...records].sort((left, right) => {
    const leftScore = dashboardRiskTone(left) === 'critical' ? 0 : 1;
    const rightScore = dashboardRiskTone(right) === 'critical' ? 0 : 1;
    return leftScore - rightScore || (deadlineValue(left) ?? Number.POSITIVE_INFINITY) - (deadlineValue(right) ?? Number.POSITIVE_INFINITY);
  }).slice(0, 4).map((record) => {
    const days = deadlineValue(record);
    const hasClause = isSuspensiveClause(record);
    return { title: record.cadastro.dadosGerais.numeroInternoSeap || recordTitle(record), detail: hasClause ? `Cláusula suspensiva ativa até ${formatDate(record.cadastro.dadosGerais.prazoFinalClausulaSuspensiva || record.cadastro.dadosGerais.vigenciaFinal)}` : days !== null && days <= 45 ? `Vigência crítica em ${Math.abs(days)} dias` : `Vigência próxima em ${Math.abs(days ?? 0)} dias`, tone: dashboardRiskTone(record), meta: record.cadastro.dadosGerais.status || 'A definir' };
  });
}

export function buildExecutionBars(records: ProcessosRecord[]): DashboardBar[] {
  return [...records].sort((left, right) => new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime()).slice(-4).map((record) => {
    const summary = buildProcessoConsolidatedSummary(record);
    return { label: monthLabel(new Date(record.updatedAt)), expected: Math.min(100, Math.round(summary.percentualContratado)), executed: Math.min(100, Math.round(summary.percentualExecutado)) };
  });
}

export function buildPlanRows(record: ProcessosRecord) {
  return record.cadastro.planoTrabalho.itens.map((item, index) => {
    const linkedContracts = record.cadastro.processoContratacaoRegistros.filter((contract) =>
      (contract.itensVinculados ?? []).some((linkedItem) => linkedItem.planoItemId === item.id),
    );
    const contractedValue = linkedContracts.reduce((sum, contract) => {
      const linkedTotal = (contract.itensVinculados ?? [])
        .filter((linkedItem) => linkedItem.planoItemId === item.id)
        .reduce((linkedSum, linkedItem) => linkedSum + parseMoney(linkedItem.valorTotalContratado), 0);
      return sum + linkedTotal;
    }, 0);
    const totalValue = parseMoney(item.valorTotalAutorizado);
    const remainingValue = Math.max(totalValue - contractedValue, 0);
    const normalizedStatus = normalizeText(item.statusItemPlano || '');
    const status =
      normalizedStatus.includes('exec') || normalizedStatus.includes('concl')
        ? 'Executado'
        : contractedValue <= 0
          ? 'Sem contratação'
          : remainingValue <= 0.01
            ? 'Totalmente contratado'
            : 'Parcialmente contratado';
    const statusTone =
      status === 'Executado'
        ? 'is-done'
        : status === 'Sem contratação'
          ? 'is-no'
          : remainingValue <= 0.01
            ? 'is-yes'
            : 'is-warning';

    return {
      id: item.id,
      order: String(index + 1).padStart(2, '0'),
      category: item.categoriaItemObjeto || 'A definir',
      item: item.item || 'Sem descrição',
      quantity: item.quantidade || '?',
      unit: item.unidadeMedida || '?',
      unitValue: item.valorUnitarioAutorizado || 'A definir',
      totalValue: item.valorTotalAutorizado || 'A definir',
      tag: item.frutoDeAjuste || 'Não',
      document: item.documentoAutorizacao || 'Sem documento',
      monitored: item.monitorado || 'Não',
      contractedValue,
      contractedValueFormatted: formatCurrency(contractedValue),
      remainingValue,
      remainingValueFormatted: formatCurrency(remainingValue),
      linkedContractsCount: linkedContracts.length,
      linkedSummary: linkedContracts.length
        ? linkedContracts.map((contract) => contract.processoSei || contract.contratoNumero || contract.id).join(', ')
        : 'Sem vínculo',
      status,
      statusTone,
    };
  });
}

export function buildContractDocuments(record: ProcessosRecord) {
  const fields = record.cadastro.processoContratacaoRegistros[0] ?? record.cadastro.processoContratacao;
  return [
    { title: 'Processo SEI', subtitle: fields.processoSei || 'Aguardando cadastro', tone: fields.processoSei ? 'success' : 'warning' },
    { title: 'Contrato e NE', subtitle: `${fields.contratoNumero || 'Contrato pendente'} / ${fields.neNumero || 'NE pendente'}`, tone: fields.contratoNumero && fields.neNumero ? 'success' : 'warning' },
    { title: 'Recebimento', subtitle: fields.termoRecebimentoDefinitivoSei || 'Sem termo definitivo', tone: fields.termoRecebimentoDefinitivoSei ? 'success' : 'neutral' },
    { title: 'Tombamento', subtitle: fields.tomboNumero || 'Sem tombamento informado', tone: fields.tomboNumero ? 'success' : 'neutral' },
  ];
}

export function buildContractPartyRows(record: ProcessosRecord): ContractPartyRow[] {
  const fields = record.cadastro.processoContratacaoRegistros[0] ?? record.cadastro.processoContratacao;
  return [
    { institution: fields.enteContratado || 'Ente contratado', cnpj: fields.cnpjContratado || 'A definir', role: 'Contratada', representative: fields.gestor || 'A definir' },
    { institution: 'SEAP / RN', cnpj: 'A definir', role: 'Gestão', representative: fields.gestor || 'A definir' },
    { institution: 'Fiscalização', cnpj: 'A definir', role: 'Fiscal', representative: fields.fiscal || 'A definir' },
  ];
}

export function buildAdjustmentAgenda(record: ProcessosRecord) {
  const fields = record.cadastro.gestaoInstrumento;
  const repasse = record.cadastro.dadosGerais.situacaoRepasseSeap || 'A definir';
  return [
    { title: 'Substatus institucional', due: fields.substatus || 'Sem definição', tone: 'warning' as const },
    { title: 'Ofício SEI', due: fields.oficioSei || 'Aguardando ofício', tone: fields.oficioSei ? ('danger' as const) : ('warning' as const) },
    { title: 'Situação do repasse SEAP', due: repasse, tone: repasse === 'Integralizado' ? ('warning' as const) : ('danger' as const) },
  ];
}

export function buildPrestacaoMetrics(record: ProcessosRecord): SummaryMetric[] {
  const dados = record.cadastro.dadosGerais;
  const summary = buildProcessoConsolidatedSummary(record);
  const valorGlobal = summary.valorTotalAutorizado;
  const contratoItens = summary.totalItensPlano;
  const itensPrestacao = record.cadastro.prestacaoContas.itens;
  const debitosLancados = summary.valorTotalPago || itensPrestacao.reduce((sum, item) => sum + parseMoney(item.valorExecutadoItem), 0);
  const comprovado = itensPrestacao.reduce((sum, item) => sum + parseMoney(item.valorComprovadoItem), 0);
  const percentualComprometido = valorGlobal > 0 ? (debitosLancados / valorGlobal) * 100 : 0;
  const pendenciasDocumentais = itensPrestacao.filter((item) => {
    const docs = [item.notaFiscalItem, item.reciboItem, item.relatorioExecucaoItem, item.documentosItem];
    return docs.some((doc) => !doc || !doc.trim());
  }).length;
  return [
    { label: 'Instrumento', value: dados.numeroInternoSeap || dados.numeroInstrumento || dados.instrumento || 'A definir', hint: dados.setorCorrelacionado || 'Unidade não informada', tone: 'primary', icon: 'assignment' },
    { label: 'Itens do plano', value: String(contratoItens), hint: `${summary.totalContratacoes} contratação(ões) vinculada(s)`, tone: 'secondary', icon: 'playlist_add_check' },
    { label: 'Executado', value: formatCurrency(debitosLancados), hint: `${formatPercent(percentualComprometido)} executado`, tone: 'primary', icon: 'payments' },
    { label: 'Pendências documentais', value: `${pendenciasDocumentais}`, hint: `${formatCurrency(comprovado)} comprovados`, tone: 'secondary', icon: 'pending_actions' },
  ];
}

export function buildPrestacaoChecklist(record: ProcessosRecord): ChecklistItem[] {
  const fields = record.cadastro.processoContratacaoRegistros[0] ?? record.cadastro.processoContratacao;
  return [
    { title: 'Portaria do gestor', subtitle: fields.portariaGestorSei || fields.gestorPortariaSei || 'Pendente', tone: fields.portariaGestorSei || fields.gestorPortariaSei ? 'success' : 'warning' },
    { title: 'Portaria do fiscal', subtitle: fields.portariaFiscalSei || fields.fiscalPortariaSei || 'Pendente', tone: fields.portariaFiscalSei || fields.fiscalPortariaSei ? 'success' : 'warning' },
    { title: 'Recebimento definitivo', subtitle: fields.termoRecebimentoDefinitivoSei || 'Pendente', tone: fields.termoRecebimentoDefinitivoSei ? 'success' : 'neutral' },
    { title: 'Informação do gestor', subtitle: fields.informacaoGestorSei || 'Pendente', tone: fields.informacaoGestorSei ? 'success' : 'neutral' },
  ];
}

export function buildPrestacaoAudits(record: ProcessosRecord): AuditEvent[] {
  const fields = record.cadastro.processoContratacaoRegistros[0] ?? record.cadastro.processoContratacao;
  return [
    { title: 'Última atualização do saldo', description: record.cadastro.dadosGerais.dataAtualizacaoSaldoConta || 'Sem data', date: record.updatedAt, tone: 'neutral' },
    { title: 'OB registrada', description: fields.obNumero || 'Sem ordem bancária', date: fields.obData || record.updatedAt, tone: fields.obNumero ? 'success' : 'neutral' },
    { title: 'Termo definitivo', description: fields.termoRecebimentoDefinitivoSei || 'Em aberto', date: fields.termoRecebimentoDefinitivoSei || record.updatedAt, tone: fields.termoRecebimentoDefinitivoSei ? 'success' : 'critical' },
  ];
}

export function buildPrestacaoFooter(record: ProcessosRecord) {
  const days = diffDays(record.cadastro.dadosGerais.vigenciaFinal);
  return { status: record.cadastro.dadosGerais.status || 'A definir', deadline: days === null ? 'A definir' : `${Math.abs(days)} dias` };
}

export function createDraftFromRecord(record: ProcessosRecord) {
  return cloneFormData(record.cadastro);
}

export function createRecordFromCadastro(formData: CadastroInstrumentoFormData, currentRecord: ProcessosRecord | null) {
  const now = new Date().toISOString();
  return {
    id: currentRecord ? currentRecord.id : `proc-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: currentRecord ? currentRecord.createdAt : now,
    updatedAt: now,
    cadastro: cloneFormData({
      ...formData,
      prestacaoContas: { ...formData.prestacaoContas, itens: syncPrestacaoItems(formData.planoTrabalho.itens, formData.prestacaoContas.itens) },
    }),
  } as ProcessosRecord;
}
