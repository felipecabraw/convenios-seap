import { startTransition, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { CadastroInstrumentoPage } from './components/cadastro/CadastroInstrumentoPage';
import { AjustePtStep } from './components/cadastro/steps/AjustePtStep';
import { GestaoInstrumentoStep } from './components/cadastro/steps/GestaoInstrumentoStep';
import { ProcessoContratacaoStep } from './components/cadastro/steps/ProcessoContratacaoStep';
import {
  sidebarItems,
  SidebarItem,
  ViewKey,
} from './data/stitch';
import {
  AjustePtForm,
  cadastroOptionSets,
  GestaoInstrumentoForm,
  PrestacaoItemForm,
  ProcessoContratacaoForm,
  ProcessoContratacaoRegistro,
  createPrestacaoItemFromPlanoItem,
  createProcessoContratacaoDraft,
} from './data/cadastro';
import {
  buildAdjustmentAgenda,
  buildDashboardAlerts,
  buildContractDocuments,
  buildContractPartyRows,
  buildDashboardDeadlines,
  buildDashboardMetrics,
  buildDashboardRecentRows,
  buildExecutionBars,
  buildInventoryDeadlines,
  buildInventoryMetrics,
  buildInventoryRows,
  buildPlanRows,
  buildProcessoConsolidatedSummary,
  buildPrestacaoAudits,
  buildPrestacaoChecklist,
  buildPrestacaoFooter,
  buildPrestacaoMetrics,
  createDraftFromRecord,
  createRecordFromCadastro,
  loadProcessosDatabase,
  ProcessosRecord,
  ProcessosDatabase,
  recordTitle,
  saveProcessosDatabase,
} from './data/processos-db';

const breadcrumbs: Record<ViewKey, string[]> = {
  dados: ['Processos', 'Novo Processo'],
  plano: ['Processos', 'Plano de Trabalho'],
  contratacao: ['Processos', 'Processo de Contratação'],
  gestao: ['Processos', 'Gestão'],
  ajustes: ['Processos', 'Ajustes'],
  prestacao: ['Processos', 'Prestação de Contas'],
};

const titles: Record<ViewKey, { title: string; subtitle: string; action: string }> = {
  dados: {
    title: 'Processos Registrados',
    subtitle: 'Base consolidada dos processos e instrumentos cadastrados no SIGINP.',
    action: 'Novo Processo',
  },
  plano: {
    title: 'Plano de Trabalho',
    subtitle: 'Itens, categorias e controle do plano.',
    action: 'Novo Item',
  },
  contratacao: {
    title: 'Processo de Contratação',
    subtitle: 'Vínculos operacionais do processo.',
    action: 'Novo Vínculo',
  },
  gestao: {
    title: 'Painel Gerencial',
    subtitle: 'Dados consolidados de execução, vigência e risco operacional.',
    action: 'Novo Processo',
  },
  ajustes: {
    title: 'Ajustes do Plano',
    subtitle: 'Fluxos de formalização e revisão.',
    action: 'Novo Ajuste',
  },
  prestacao: {
    title: 'Prestação de Contas',
    subtitle: 'Fechamento do instrumento com leitura financeira, documental e por item.',
    action: 'Finalizar Prestação',
  },
};

const sidebarAccentThemes: Record<SidebarItem['key'], { accent: string; accentSoft: string; accentGlow: string }> = {
  painel: {
    accent: '#2f6fed',
    accentSoft: '#dbe8ff',
    accentGlow: 'rgba(47, 111, 237, 0.18)',
  },
  'novo-processo': {
    accent: '#d19a2b',
    accentSoft: '#f7e1b2',
    accentGlow: 'rgba(209, 154, 43, 0.20)',
  },
  processos: {
    accent: '#1f9d74',
    accentSoft: '#d8f1e8',
    accentGlow: 'rgba(31, 157, 116, 0.20)',
  },
  relatorios: {
    accent: '#d94b64',
    accentSoft: '#f7d9df',
    accentGlow: 'rgba(217, 75, 100, 0.20)',
  },
  configuracoes: {
    accent: '#8b6adf',
    accentSoft: '#e4dbfb',
    accentGlow: 'rgba(139, 106, 223, 0.20)',
  },
};

function getSidebarTheme(key: SidebarItem['key']) {
  return sidebarAccentThemes[key] ?? sidebarAccentThemes.processos;
}

const PRESTACAO_HASHES = new Set([
  '#prestacao-instrumento',
  '#prestacao-resumo',
  '#prestacao-global',
  '#prestacao-itens',
  '#prestacao-financeiro',
  '#prestacao-encerramento',
]);

function setAppHash(hash: string | null) {
  if (typeof window === 'undefined') return;

  const nextUrl = hash ? `${window.location.pathname}${window.location.search}${hash}` : `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, '', nextUrl);
}

type ViewData = {
  inventoryRows: ReturnType<typeof buildInventoryRows>;
  inventoryMetrics: ReturnType<typeof buildInventoryMetrics>;
  inventoryDeadlines: ReturnType<typeof buildInventoryDeadlines>;
  dashboardMetrics: ReturnType<typeof buildDashboardMetrics>;
  dashboardDeadlines: ReturnType<typeof buildDashboardDeadlines>;
  dashboardAlerts: ReturnType<typeof buildDashboardAlerts>;
  dashboardRecentRows: ReturnType<typeof buildDashboardRecentRows>;
  dashboardBars: ReturnType<typeof buildExecutionBars>;
  planRows: ReturnType<typeof buildPlanRows>;
  contractDocuments: ReturnType<typeof buildContractDocuments>;
  contractParties: ReturnType<typeof buildContractPartyRows>;
  agendaCards: ReturnType<typeof buildAdjustmentAgenda>;
  prestacaoMetrics: ReturnType<typeof buildPrestacaoMetrics>;
  prestacaoChecklist: ReturnType<typeof buildPrestacaoChecklist>;
  prestacaoAudits: ReturnType<typeof buildPrestacaoAudits>;
  prestacaoFooter: ReturnType<typeof buildPrestacaoFooter>;
};

function getSidebarActiveKey(view: ViewKey, isCadastroOpen: boolean) {
  if (view === 'dados' && isCadastroOpen) return 'novo-processo';
  if (view === 'gestao') return 'painel';
  if (view === 'ajustes') return 'configuracoes';
  if (view === 'prestacao') return 'relatorios';
  return 'processos';
}

function buildAppData(records: ProcessosDatabase['records'], selectedRecordId: string): ViewData {
  const selectedRecord = records.find((record) => record.id === selectedRecordId) ?? records[0] ?? null;

  return {
    inventoryRows: buildInventoryRows(records),
    inventoryMetrics: buildInventoryMetrics(records),
    inventoryDeadlines: buildInventoryDeadlines(records),
    dashboardMetrics: buildDashboardMetrics(records),
    dashboardDeadlines: buildDashboardDeadlines(records),
    dashboardAlerts: buildDashboardAlerts(records),
    dashboardRecentRows: buildDashboardRecentRows(records),
    dashboardBars: buildExecutionBars(records),
    planRows: selectedRecord ? buildPlanRows(selectedRecord) : [],
    contractDocuments: selectedRecord ? buildContractDocuments(selectedRecord) : [],
    contractParties: selectedRecord ? buildContractPartyRows(selectedRecord) : [],
    agendaCards: selectedRecord ? buildAdjustmentAgenda(selectedRecord) : [],
    prestacaoMetrics: selectedRecord ? buildPrestacaoMetrics(selectedRecord) : [],
    prestacaoChecklist: selectedRecord ? buildPrestacaoChecklist(selectedRecord) : [],
    prestacaoAudits: selectedRecord ? buildPrestacaoAudits(selectedRecord) : [],
    prestacaoFooter: selectedRecord ? buildPrestacaoFooter(selectedRecord) : { status: 'A definir', deadline: 'A definir' },
  };
}

function syncPrestacaoItemsForRecord(record: ProcessosRecord | null) {
  if (!record) return [];

  const currentById = new Map(record.cadastro.prestacaoContas.itens.map((item) => [item.itemPlanoId, item]));

  return record.cadastro.planoTrabalho.itens.map((item) => {
    const existing = currentById.get(item.id);
    const base = createPrestacaoItemFromPlanoItem(item);

    return existing
      ? {
          ...base,
          ...existing,
          itemPlanoId: item.id,
          itemPlanoDescricao: item.item,
          categoriaItemObjeto: item.categoriaItemObjeto,
          quantidadePrevista: item.quantidade,
          valorUnitarioPrevisto: item.valorUnitarioAutorizado,
          valorTotalPrevisto: item.valorTotalAutorizado,
        }
      : base;
  });
}

function updateSelectedCadastroSlice<
  SliceKey extends 'gestaoInstrumento' | 'ajustePt',
  FieldKey extends keyof ProcessosRecord['cadastro'][SliceKey],
>(
  current: ProcessosDatabase,
  recordId: string,
  sliceKey: SliceKey,
  field: FieldKey,
  value: ProcessosRecord['cadastro'][SliceKey][FieldKey],
) {
  const target = current.records.find((record) => record.id === recordId);
  if (!target) return current;

  const updatedRecord: ProcessosRecord = {
    ...target,
    updatedAt: new Date().toISOString(),
    cadastro: {
      ...target.cadastro,
      [sliceKey]: {
        ...target.cadastro[sliceKey],
        [field]: value,
      },
    },
  };

  return {
    ...current,
    records: current.records.map((record) => (record.id === recordId ? updatedRecord : record)),
    lastSyncAt: new Date().toISOString(),
  };
}

function App() {
  const [processosDb, setProcessosDb] = useState<ProcessosDatabase>(() => loadProcessosDatabase());
  const [activeView, setActiveView] = useState<ViewKey>('gestao');
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [viewingRecordId, setViewingRecordId] = useState<string | null>(null);
  const selectedRecord = useMemo(
    () => processosDb.records.find((record) => record.id === processosDb.selectedRecordId) ?? processosDb.records[0] ?? null,
    [processosDb],
  );
  const editingRecord = useMemo(
    () => processosDb.records.find((record) => record.id === editingRecordId) ?? null,
    [processosDb.records, editingRecordId],
  );
  const viewingRecord = useMemo(
    () => processosDb.records.find((record) => record.id === viewingRecordId) ?? null,
    [processosDb.records, viewingRecordId],
  );
  const dashboardUpdatedAt = useMemo(() => formatDashboardUpdatedAt(processosDb.lastSyncAt), [processosDb.lastSyncAt]);
  const viewData = useMemo(
    () => buildAppData(processosDb.records, selectedRecord?.id ?? processosDb.selectedRecordId),
    [processosDb.records, processosDb.selectedRecordId, selectedRecord?.id],
  );
  const activeSidebarKey = getSidebarActiveKey(activeView, isCadastroOpen);
  const activeSidebarLabel =
    sidebarItems.find((item) => item.key === activeSidebarKey)?.label ?? titles[activeView].title;

  useEffect(() => {
    saveProcessosDatabase({
      ...processosDb,
      lastSyncAt: new Date().toISOString(),
    });
  }, [processosDb]);

  useEffect(() => {
    const syncPrestacaoHash = () => {
      if (typeof window === 'undefined') return;

      const hash = window.location.hash;
      if (!PRESTACAO_HASHES.has(hash)) return;

      setActiveView('prestacao');
      setIsCadastroOpen(false);
      setEditingRecordId(null);
      setViewingRecordId(null);

      window.setTimeout(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    };

    syncPrestacaoHash();
    window.addEventListener('hashchange', syncPrestacaoHash);
    return () => window.removeEventListener('hashchange', syncPrestacaoHash);
  }, []);

  function handleNavigate(view: ViewKey) {
    startTransition(() => {
      setActiveView(view);
      setIsCadastroOpen(false);
      setEditingRecordId(null);
      setViewingRecordId(null);
    });

    setAppHash(view === 'prestacao' ? '#prestacao-resumo' : null);
  }

  function handleLogout() {
    startTransition(() => {
      setActiveView('gestao');
      setIsCadastroOpen(false);
      setEditingRecordId(null);
      setViewingRecordId(null);
    });

    setAppHash(null);
  }

  function handleSidebarAction(target: ViewKey, action?: 'navigate' | 'openCadastro') {
    if (action === 'openCadastro') {
      handleOpenCadastro();
      return;
    }

    handleNavigate(target);
  }

  function handleOpenCadastro() {
    handleOpenCadastroForRecord(null);
  }

  function handleOpenCadastroForRecord(recordId: string | null) {
    startTransition(() => {
      setActiveView('dados');
      setIsCadastroOpen(true);
      setEditingRecordId(recordId);
      if (recordId) {
        setProcessosDb((current) => ({
          ...current,
          selectedRecordId: recordId,
          lastSyncAt: new Date().toISOString(),
        }));
      }
    });

    setAppHash(null);
  }

  function handleSelectRecord(recordId: string) {
    startTransition(() => {
      setProcessosDb((current) => ({
        ...current,
        selectedRecordId: recordId,
        lastSyncAt: new Date().toISOString(),
      }));
    });
  }

  function updateSelectedContratacaoDraft<K extends keyof ProcessoContratacaoForm>(field: K, value: ProcessoContratacaoForm[K]) {
    setProcessosDb((current) => {
      const recordId = current.selectedRecordId;
      const target = current.records.find((record) => record.id === recordId);
      if (!target) return current;

      const updatedRecord: ProcessosRecord = {
        ...target,
        updatedAt: new Date().toISOString(),
        cadastro: {
          ...target.cadastro,
          processoContratacao: {
            ...target.cadastro.processoContratacao,
            [field]: value,
          },
        },
      };

      return {
        ...current,
        records: current.records.map((record) => (record.id === recordId ? updatedRecord : record)),
        lastSyncAt: new Date().toISOString(),
      };
    });
  }

  function replaceSelectedContratacaoDraft(draft: ProcessoContratacaoForm) {
    setProcessosDb((current) => {
      const recordId = current.selectedRecordId;
      const target = current.records.find((record) => record.id === recordId);
      if (!target) return current;

      const updatedRecord: ProcessosRecord = {
        ...target,
        updatedAt: new Date().toISOString(),
        cadastro: {
          ...target.cadastro,
          processoContratacao: draft,
        },
      };

      return {
        ...current,
        records: current.records.map((record) => (record.id === recordId ? updatedRecord : record)),
        lastSyncAt: new Date().toISOString(),
      };
    });
  }

  function updateSelectedContratacaoRecords(records: ProcessoContratacaoRegistro[]) {
    setProcessosDb((current) => {
      const recordId = current.selectedRecordId;
      const target = current.records.find((record) => record.id === recordId);
      if (!target) return current;

      const updatedRecord: ProcessosRecord = {
        ...target,
        updatedAt: new Date().toISOString(),
        cadastro: {
          ...target.cadastro,
          processoContratacaoRegistros: records,
        },
      };

      return {
        ...current,
        records: current.records.map((record) => (record.id === recordId ? updatedRecord : record)),
        lastSyncAt: new Date().toISOString(),
      };
    });
  }

  function updateSelectedGestao<K extends keyof GestaoInstrumentoForm>(field: K, value: GestaoInstrumentoForm[K]) {
    setProcessosDb((current) => updateSelectedCadastroSlice(current, current.selectedRecordId, 'gestaoInstrumento', field, value));
  }

  function updateSelectedAjuste<K extends keyof AjustePtForm>(field: K, value: AjustePtForm[K]) {
    setProcessosDb((current) => updateSelectedCadastroSlice(current, current.selectedRecordId, 'ajustePt', field, value));
  }

  function handleOpenFinanceiro(recordId: string) {
    handleSelectRecord(recordId);
    handleNavigate('prestacao');
  }

  function handleOpenPlano(recordId: string) {
    handleSelectRecord(recordId);
    handleNavigate('plano');
  }

  function handleOpenContratacao(recordId: string) {
    handleSelectRecord(recordId);
    handleNavigate('contratacao');
  }

  function handleViewRecord(recordId: string) {
    handleSelectRecord(recordId);
    setViewingRecordId(recordId);
  }

  function handleCloseViewer() {
    setViewingRecordId(null);
  }

  function handleSaveCadastro(formData: Parameters<typeof createRecordFromCadastro>[0]) {
    setProcessosDb((current) => {
      const currentRecord = editingRecordId ? current.records.find((record) => record.id === editingRecordId) ?? null : null;
      const updatedRecord = createRecordFromCadastro(formData, currentRecord);
      const nextRecords = editingRecordId
        ? current.records.map((item) => (item.id === editingRecordId ? updatedRecord : item))
        : [...current.records, updatedRecord];
      return {
        ...current,
        records: nextRecords,
        selectedRecordId: updatedRecord.id,
        lastSyncAt: new Date().toISOString(),
      };
    });
    setIsCadastroOpen(false);
    setEditingRecordId(null);
    setActiveView('dados');
  }

  return (
    <div className={`app-shell app-shell--${activeView}${isCadastroOpen ? ' app-shell--cadastro' : ''}`}>
      <aside className="side-rail">
        <div className="brand-block">
          <div className="brand-mark">
            <img src="/policia-penal-rn.png" alt="Policia Penal RN" />
          </div>
          <div>
            <h1>SEAP / RN</h1>
            <p>Administração Penitenciária</p>
          </div>
        </div>

        <nav className="side-nav" aria-label="Navegação principal">
          {sidebarItems.map((item) => (
            (() => {
              const theme = getSidebarTheme(item.key);
              const isActive = item.key === activeSidebarKey;
              return (
            <button
              key={item.key}
              type="button"
              className={item.key === activeSidebarKey ? `side-nav__item side-nav__item--${item.key} is-active` : `side-nav__item side-nav__item--${item.key}`}
              style={
                isActive
                  ? ({
                      '--sidebar-accent': theme.accent,
                      '--sidebar-accent-soft': theme.accentSoft,
                      '--sidebar-accent-glow': theme.accentGlow,
                    } as CSSProperties)
                  : undefined
              }
              onClick={() => handleSidebarAction(item.target, item.action)}
            >
              <span className="side-nav__icon">
                <span className="material-symbols-outlined">{item.icon}</span>
              </span>
              <span>
                {item.key === 'relatorios'
                  ? 'Prestação de Contas'
                  : item.key === 'configuracoes'
                    ? 'Configurações'
                : item.label}
              </span>
            </button>
              );
            })()
          ))}
        </nav>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="topbar__brand">
            <img className="topbar__flag" src="/rn-flag.svg" alt="Bandeira do Rio Grande do Norte" />
            <strong>SIGINP - Sistema de Gestão de Instrumentos e Projetos Penais</strong>
          </div>
          <div className="topbar__meta" aria-label="Contexto atual">
            <span
              className="topbar__context"
              style={
                ({
                  '--sidebar-accent': getSidebarTheme(activeSidebarKey).accent,
                  '--sidebar-accent-soft': getSidebarTheme(activeSidebarKey).accentSoft,
                  '--sidebar-accent-glow': getSidebarTheme(activeSidebarKey).accentGlow,
                } as CSSProperties)
              }
            >
              {activeSidebarLabel}
            </span>
            <div className="topbar__session" aria-label="Perfil e saída da sessão">
              <span className="topbar__profile topbar__profile--icon" title="Perfil institucional" aria-hidden="true">
                <span className="material-symbols-outlined" aria-hidden="true">
                  account_circle
                </span>
              </span>
              <button
                type="button"
                className="topbar__logout"
                onClick={handleLogout}
                aria-label="Sair da sessão atual"
                title="Sair"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  logout
                </span>
              </button>
            </div>
          </div>
        </header>

        <main className="content">
          {isCadastroOpen && activeView === 'dados' ? (
            <CadastroInstrumentoPage
              onSave={handleSaveCadastro}
              onCancel={() => {
                setIsCadastroOpen(false);
                setEditingRecordId(null);
                setActiveView('dados');
              }}
              initialData={editingRecord ? createDraftFromRecord(editingRecord) : undefined}
            />
          ) : (
            renderView(
              activeView,
              breadcrumbs[activeView],
              titles[activeView],
              viewData,
              processosDb.records,
              selectedRecord,
              handleOpenCadastroForRecord,
              handleOpenFinanceiro,
              handleOpenPlano,
              handleOpenContratacao,
              handleViewRecord,
              handleSelectRecord,
              () => setActiveView('dados'),
              dashboardUpdatedAt,
              updateSelectedContratacaoDraft,
              replaceSelectedContratacaoDraft,
              updateSelectedContratacaoRecords,
              updateSelectedGestao,
              updateSelectedAjuste,
            )
          )}
        </main>
      </div>
      {viewingRecord ? <RecordViewerModal record={viewingRecord} onClose={handleCloseViewer} /> : null}
    </div>
  );
}

function renderView(
  view: ViewKey,
  breadcrumb: string[],
  title: { title: string; subtitle: string; action: string },
  data: ViewData,
  records: ProcessosRecord[],
  selectedRecord: ProcessosRecord | null,
  onOpenCadastroForRecord: (recordId: string) => void,
  onOpenFinanceiro: (recordId: string) => void,
  onOpenPlano: (recordId: string) => void,
  onOpenContratacao: (recordId: string) => void,
  onViewRecord: (recordId: string) => void,
  onSelectRecord: (recordId: string) => void,
  onBackToDados: () => void,
  dashboardUpdatedAt: string,
  onContratacaoDraftChange: <K extends keyof ProcessoContratacaoForm>(field: K, value: ProcessoContratacaoForm[K]) => void,
  onContratacaoDraftReplace: (draft: ProcessoContratacaoForm) => void,
  onContratacaoRecordsChange: (records: ProcessoContratacaoRegistro[]) => void,
  onGestaoChange: <K extends keyof GestaoInstrumentoForm>(field: K, value: GestaoInstrumentoForm[K]) => void,
  onAjusteChange: <K extends keyof AjustePtForm>(field: K, value: AjustePtForm[K]) => void,
) {
  switch (view) {
    case 'dados':
      return (
        <InventoryView
          breadcrumb={breadcrumb}
          title={title}
          records={records}
          rows={data.inventoryRows}
          selectedRecordId={selectedRecord?.id ?? ''}
          onOpenCadastroForRecord={onOpenCadastroForRecord}
          onOpenFinanceiro={onOpenFinanceiro}
          onOpenPlano={onOpenPlano}
          onOpenContratacao={onOpenContratacao}
          onViewRecord={onViewRecord}
          onSelectRecord={onSelectRecord}
        />
      );
    case 'plano':
      return <PlanView breadcrumb={breadcrumb} title={title} rows={data.planRows} record={selectedRecord} />;
    case 'contratacao':
      return (
        <ContractView
          breadcrumb={breadcrumb}
          title={title}
          record={selectedRecord}
          documents={data.contractDocuments}
          parties={data.contractParties}
          onDraftChange={onContratacaoDraftChange}
          onDraftReplace={onContratacaoDraftReplace}
          onRecordsChange={onContratacaoRecordsChange}
        />
      );
    case 'gestao':
      return (
        <ManagementView
          breadcrumb={breadcrumb}
          title={title}
          dashboardUpdatedAt={dashboardUpdatedAt}
          records={records}
          record={selectedRecord}
          onGestaoChange={onGestaoChange}
        />
      );
    case 'ajustes':
      return <AdjustmentView breadcrumb={breadcrumb} title={title} agendaCards={data.agendaCards} record={selectedRecord} onChange={onAjusteChange} />;
    case 'prestacao':
      return (
        <PrestacaoView
          breadcrumb={breadcrumb}
          title={title}
          record={selectedRecord}
          onBack={onBackToDados}
        />
      );
    default:
      return null;
  }
}

function SectionHeader({
  breadcrumb,
  title,
  subtitle,
  action,
  onAction,
}: {
  breadcrumb: string[];
  title: string;
  subtitle: string;
  action: string;
  onAction?: () => void;
}) {
  return (
    <header className="page-head">
      <div className="crumbs">
        {breadcrumb.map((item, index) => (
          <span key={item} className={index === breadcrumb.length - 1 ? 'crumb is-current' : 'crumb'}>
            {item}
          </span>
        ))}
      </div>
      <div className="page-head__row">
        <div className="page-head__copy">
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <div className="page-head__actions">
          {onAction ? (
            <button type="button" className="button button--primary" onClick={onAction}>
              <span className="material-symbols-outlined">add</span>
              {action}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function InventoryView({
  title,
  records,
  rows,
  selectedRecordId,
  onOpenCadastroForRecord,
  onOpenFinanceiro,
  onOpenPlano,
  onOpenContratacao,
  onViewRecord,
  onSelectRecord,
}: {
  breadcrumb: string[];
  title: { title: string; subtitle: string; action: string };
  records: ProcessosRecord[];
  rows: ViewData['inventoryRows'];
  selectedRecordId: string;
  onOpenCadastroForRecord: (recordId: string) => void;
  onOpenFinanceiro: (recordId: string) => void;
  onOpenPlano: (recordId: string) => void;
  onOpenContratacao: (recordId: string) => void;
  onViewRecord: (recordId: string) => void;
  onSelectRecord: (recordId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [instrumentFilter, setInstrumentFilter] = useState('Todos os instrumentos');
  const [statusFilter, setStatusFilter] = useState('Todos os status');
  const [sectorFilter, setSectorFilter] = useState('Todas as unidades');
  const normalizedQuery = query.trim().toLowerCase();
  const rowById = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows]);
  const instrumentOptions = useMemo(
    () => ['Todos os instrumentos', ...Array.from(new Set(records.map((record) => record.cadastro.dadosGerais.instrumento).filter(Boolean)))],
    [records],
  );
  const statusOptions = useMemo(
    () => ['Todos os status', ...Array.from(new Set(records.map((record) => record.cadastro.dadosGerais.status).filter(Boolean)))],
    [records],
  );
  const sectorOptions = useMemo(
    () => ['Todas as unidades', ...cadastroOptionSets.unidadesSistema.map((option) => option.value)],
    [],
  );
  const filteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const dados = record.cadastro.dadosGerais;
        const processo = record.cadastro.processoContratacao;
        const unidade =
          processo.relatorioBeneficiados ||
          processo.localizacao ||
          processo.unidadeBeneficiada ||
          dados.setorCorrelacionado ||
          dados.eixo;
        const searchable = [
          recordTitle(record),
          dados.instrumento,
          dados.status,
          dados.setorCorrelacionado,
          dados.eixo,
          processo.relatorioBeneficiados,
          processo.localizacao,
          processo.unidadeBeneficiada,
          dados.numeroInternoSeap,
          dados.numeroInstrumento,
        ]
          .join(' ')
          .toLowerCase();
        const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
        const matchesInstrument =
          instrumentFilter === 'Todos os instrumentos' || dados.instrumento === instrumentFilter;
        const matchesStatus = statusFilter === 'Todos os status' || dados.status === statusFilter;
        const matchesSector = sectorFilter === 'Todas as unidades' || unidade === sectorFilter;
        return matchesQuery && matchesInstrument && matchesStatus && matchesSector;
      }),
    [instrumentFilter, normalizedQuery, records, sectorFilter, statusFilter],
  );
  const visibleRows = useMemo(
    () => filteredRecords.map((record) => rowById.get(record.id)).filter((row): row is ViewData['inventoryRows'][number] => Boolean(row)),
    [filteredRecords, rowById],
  );
  const totalRows = rows.length;
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * pageSize;
  const pageRows = visibleRows.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const visibleCount = visibleRows.length;
  const selectedRecord = records.find((record) => record.id === selectedRecordId) ?? filteredRecords[0] ?? records[0] ?? null;
  const selectedRow = selectedRecord ? rowById.get(selectedRecord.id) : null;
  const kpis = [
    { label: 'Total de processos', value: String(totalRows), hint: 'Todos os registros', icon: 'article', tone: 'info' },
    { label: 'Em execução', value: String(rows.filter((row) => row.statusTone === 'info' || row.status.toLowerCase().includes('execu')).length), hint: `${totalRows ? Math.round((rows.filter((row) => row.statusTone === 'info' || row.status.toLowerCase().includes('execu')).length / totalRows) * 100) : 0}% do total`, icon: 'event_note', tone: 'success' },
    { label: 'Prestação', value: String(rows.filter((row) => row.status.toLowerCase().includes('presta')).length), hint: `${totalRows ? Math.round((rows.filter((row) => row.status.toLowerCase().includes('presta')).length / totalRows) * 100) : 0}% do total`, icon: 'description', tone: 'warning' },
    { label: 'Concluídos', value: String(rows.filter((row) => row.statusTone === 'success' || row.status.toLowerCase().includes('concl')).length), hint: `${totalRows ? Math.round((rows.filter((row) => row.statusTone === 'success' || row.status.toLowerCase().includes('concl')).length / totalRows) * 100) : 0}% do total`, icon: 'check_circle', tone: 'info' },
    { label: 'Atrasados', value: String(rows.filter((row) => row.statusTone === 'danger').length), hint: `${totalRows ? Math.round((rows.filter((row) => row.statusTone === 'danger').length / totalRows) * 100) : 0}% do total`, icon: 'schedule', tone: 'danger' },
  ];

  return (
    <section className="view inventory-page inventory-page--reference">
      <header className="inventory-reference-head">
        <div>
          <div className="crumbs inventory-reference-crumbs">
            <span className="crumb">Início</span>
            <span className="crumb is-current">Processos Registrados</span>
          </div>
          <h2>{title.title}</h2>
          <p>Consulte e gerencie os processos de convênios, termos e instrumentos cadastrados no sistema.</p>
        </div>
        <div className="inventory-reference-toolbar">
          <button type="button" className="inventory-ref-control">
            <span className="material-symbols-outlined" aria-hidden="true">calendar_month</span>
            2025
            <span className="material-symbols-outlined" aria-hidden="true">expand_more</span>
          </button>
          <button type="button" className="inventory-ref-control">
            <span className="material-symbols-outlined" aria-hidden="true">attach_money</span>
            Todos os órgãos
            <span className="material-symbols-outlined" aria-hidden="true">expand_more</span>
          </button>
          <button type="button" className="inventory-ref-bell" aria-label="Notificações">
            <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
            <strong>10</strong>
          </button>
          <span className="inventory-ref-avatar">FC</span>
        </div>
      </header>

      <div className="inventory-reference-layout">
        <main className="inventory-reference-main">
          <section className="inventory-reference-filters">
            <label className="inventory-ref-search">
              <span className="material-symbols-outlined" aria-hidden="true">search</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar processo" type="search" />
            </label>
            <label className="inventory-ref-select">
              <span>Status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                {statusOptions.map((option) => <option key={option} value={option}>{option.replace('Todos os status', 'Todos')}</option>)}
              </select>
            </label>
            <label className="inventory-ref-select">
              <span>Instrumento</span>
              <select value={instrumentFilter} onChange={(event) => setInstrumentFilter(event.target.value)}>
                {instrumentOptions.map((option) => <option key={option} value={option}>{option.replace('Todos os instrumentos', 'Todos')}</option>)}
              </select>
            </label>
            <label className="inventory-ref-select">
              <span>Unidade</span>
              <select value={sectorFilter} onChange={(event) => setSectorFilter(event.target.value)}>
                {sectorOptions.map((option) => <option key={option} value={option}>{option.replace('Todas as unidades', 'Todas')}</option>)}
              </select>
            </label>
            <button type="button" className="inventory-ref-filter-button">
              <span className="material-symbols-outlined" aria-hidden="true">filter_list</span>
              Mais filtros
              <span className="material-symbols-outlined" aria-hidden="true">expand_more</span>
            </button>
            <button
              type="button"
              className="inventory-ref-clear"
              onClick={() => {
                setQuery('');
                setInstrumentFilter('Todos os instrumentos');
                setStatusFilter('Todos os status');
                setSectorFilter('Todas as unidades');
              }}
            >
              <span className="material-symbols-outlined" aria-hidden="true">refresh</span>
              Limpar filtros
            </button>
            <button type="button" className="inventory-ref-new" onClick={() => onOpenCadastroForRecord('')}>
              <span className="material-symbols-outlined" aria-hidden="true">add</span>
              Novo processo
            </button>
          </section>

          <section className="inventory-reference-kpis" aria-label="Resumo dos processos">
            {kpis.map((metric) => (
              <article key={metric.label} className={`inventory-reference-kpi inventory-reference-kpi--${metric.tone}`}>
                <span className="material-symbols-outlined" aria-hidden="true">{metric.icon}</span>
                <div>
                  <small>{metric.label}</small>
                  <strong>{metric.value}</strong>
                  <em>{metric.hint}</em>
                </div>
              </article>
            ))}
          </section>

          <section className="inventory-reference-table-card">
            <div className="inventory-reference-table-head">
              <strong>{visibleCount} processos encontrados</strong>
              <div>
                <label>Exibir <select value={pageSize} disabled><option>{pageSize}</option></select></label>
                <label>Ordenar por <select disabled><option>Mais recentes</option></select></label>
              </div>
            </div>

            <div className="inventory-reference-table-wrap">
              <table className="inventory-reference-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Nº do Processo</th>
                    <th>Instrumento</th>
                    <th>Unidade</th>
                    <th>Status</th>
                    <th>Valor Global</th>
                    <th>Início</th>
                    <th>Fim</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length ? pageRows.map((row) => {
                    const record = records.find((item) => item.id === row.id);
                    const dados = record?.cadastro.dadosGerais;
                    return (
                      <tr key={row.id} className={row.id === selectedRecord?.id ? 'is-selected' : ''} onClick={() => onSelectRecord(row.id)}>
                        <td><button type="button" className="inventory-ref-star" aria-label="Favoritar processo"><span className="material-symbols-outlined" aria-hidden="true">star</span></button></td>
                        <td><strong className="inventory-ref-process">{row.ref}</strong><small>{row.title}</small></td>
                        <td><span>{dados?.modalidade || row.title}</span><small>{dados?.numeroInstrumento || row.subtitle}</small></td>
                        <td><span>SEAP</span><small>{row.subtitle}</small></td>
                        <td><span className={`inventory-ref-status inventory-ref-status--${row.statusTone}`}>{row.status}</span></td>
                        <td>{row.amount}</td>
                        <td>{dados?.vigenciaInicial || '-'}</td>
                        <td>{row.due}</td>
                        <td>
                          <div className="inventory-reference-actions" onClick={(event) => event.stopPropagation()}>
                            <button type="button" onClick={() => onOpenCadastroForRecord(row.id)} aria-label="Editar"><span className="material-symbols-outlined" aria-hidden="true">edit</span></button>
                            <button type="button" onClick={() => onViewRecord(row.id)} aria-label="Resumo"><span className="material-symbols-outlined" aria-hidden="true">article</span></button>
                            <button type="button" onClick={() => onOpenContratacao(row.id)} aria-label="Contratações"><span className="material-symbols-outlined" aria-hidden="true">shopping_cart</span></button>
                            <button type="button" onClick={() => onOpenFinanceiro(row.id)} aria-label="Prestação"><span className="material-symbols-outlined" aria-hidden="true">attach_money</span></button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={9}>
                        <div className="empty-module-state">
                          <strong>Nenhum registro encontrado</strong>
                          <p>Revise os filtros aplicados ou limpe a busca para voltar à lista completa.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="inventory-reference-footer">
              <span>Exibindo {pageRows.length ? startIndex + 1 : 0} a {Math.min(startIndex + pageRows.length, visibleCount)} de {visibleCount} resultados</span>
              <div className="inventory-reference-pagination">
                <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} aria-label="Página anterior">
                  <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1).map((page) => (
                  <button key={page} type="button" className={page === currentPage ? 'is-active' : ''} onClick={() => setCurrentPage(page)}>{page}</button>
                ))}
                {totalPages > 5 ? <span>...</span> : null}
                {totalPages > 5 ? <button type="button" onClick={() => setCurrentPage(totalPages)}>{totalPages}</button> : null}
                <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} aria-label="Próxima página">
                  <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
                </button>
              </div>
            </footer>
          </section>
        </main>

        {selectedRecord && selectedRow ? (
          <aside className="inventory-reference-detail">
            <button type="button" className="inventory-reference-detail__close" aria-label="Fechar painel">
              <span className="material-symbols-outlined" aria-hidden="true">close</span>
            </button>
            <span className="inventory-reference-chip">{selectedRecord.cadastro.dadosGerais.modalidade || 'Convênio'}</span>
            <h3>{selectedRow.ref}</h3>
            <p>{selectedRow.title}</p>
            <span className={`inventory-ref-status inventory-ref-status--${selectedRow.statusTone}`}>{selectedRow.status}</span>

            <nav className="inventory-reference-tabs" aria-label="Abas do processo">
              <button type="button" className="is-active"><span className="material-symbols-outlined" aria-hidden="true">explore</span>Resumo</button>
              <button type="button" onClick={() => onOpenPlano(selectedRecord.id)}><span className="material-symbols-outlined" aria-hidden="true">article</span>Plano</button>
              <button type="button" onClick={() => onOpenContratacao(selectedRecord.id)}><span className="material-symbols-outlined" aria-hidden="true">event_note</span>Contratações</button>
              <button type="button" onClick={() => onOpenFinanceiro(selectedRecord.id)}><span className="material-symbols-outlined" aria-hidden="true">request_quote</span>Prestação</button>
            </nav>

            <section className="inventory-reference-detail__section">
              <h4>Dados do instrumento</h4>
              <dl>
                <div><dt>Instrumento</dt><dd>{selectedRecord.cadastro.dadosGerais.instrumento || selectedRow.title}</dd></div>
                <div><dt>Concedente</dt><dd>SEAP - Secretaria de Estado da Administração Penitenciária</dd></div>
                <div><dt>Convenente</dt><dd>{selectedRecord.cadastro.dadosGerais.setorCorrelacionado || selectedRow.subtitle}</dd></div>
                <div><dt>Valor Global</dt><dd>{selectedRow.amount}</dd></div>
                <div><dt>Vigência</dt><dd>{selectedRecord.cadastro.dadosGerais.vigenciaInicial || '-'} a {selectedRow.due}</dd></div>
              </dl>
            </section>

            <section className="inventory-reference-detail__section">
              <h4>Situação</h4>
              <dl>
                <div><dt>Status</dt><dd>{selectedRow.status}</dd></div>
                <div><dt>Percentual de execução</dt><dd><span className="inventory-reference-progress"><i style={{ width: `${selectedRow.progress}%` }} /></span>{selectedRow.progress}%</dd></div>
                <div><dt>Última atualização</dt><dd>{formatDashboardUpdatedAt(selectedRecord.updatedAt)}</dd></div>
                <div><dt>Próxima etapa</dt><dd>Execução financeira</dd></div>
              </dl>
            </section>

            <div className="inventory-reference-detail__actions">
              <button type="button" onClick={() => onOpenCadastroForRecord(selectedRecord.id)}><span className="material-symbols-outlined" aria-hidden="true">edit</span>Editar</button>
              <button type="button" onClick={() => onOpenPlano(selectedRecord.id)}><span className="material-symbols-outlined" aria-hidden="true">event_note</span>Plano de Trabalho</button>
              <button type="button" onClick={() => onOpenContratacao(selectedRecord.id)}><span className="material-symbols-outlined" aria-hidden="true">shopping_cart</span>Contratações</button>
              <button type="button" onClick={() => onOpenFinanceiro(selectedRecord.id)}><span className="material-symbols-outlined" aria-hidden="true">attach_money</span>Prestação de Contas</button>
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}

function PlanView({
  breadcrumb,
  title,
  rows,
  record,
}: {
  breadcrumb: string[];
  title: { title: string; subtitle: string; action: string };
  rows: ViewData['planRows'];
  record: ProcessosRecord | null;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const percentFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const summary = record ? buildProcessoConsolidatedSummary(record) : null;
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredRows = normalizedSearch
    ? rows.filter((row) =>
        [row.category, row.item, row.document, row.tag, row.unit]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : rows;
  const totalPlan = rows.reduce((sum, row) => sum + parsePlanMoney(row.totalValue), 0);
  const executedValue = summary?.valorTotalPago ?? 0;
  const remainingValue = Math.max(totalPlan - executedValue, 0);
  const executionPercent = totalPlan > 0 ? Math.min(100, (executedValue / totalPlan) * 100) : 0;
  const completedItems = rows.filter((row) => row.monitored === 'Sim').length;
  const categoryTotals = rows.reduce<Record<string, number>>((acc, row) => {
    const category = row.category || 'Outros';
    acc[category] = (acc[category] ?? 0) + parsePlanMoney(row.totalValue);
    return acc;
  }, {});
  const categoryEntries = Object.entries(categoryTotals)
    .sort(([, left], [, right]) => right - left)
    .slice(0, 6);
  const donutStops = buildPlanDonutStops(categoryEntries.map(([, value]) => value), totalPlan);
  const planNumber =
    record?.cadastro.dadosGerais.numeroInternoSeap ||
    record?.cadastro.dadosGerais.numeroInstrumento ||
    record?.id ||
    '000123/2024-1';
  const grantor = 'SEAP - Secretaria de Estado da Administração Penitenciária';
  const proponent = record?.cadastro.dadosGerais.setorCorrelacionado || 'Prefeitura Municipal de Natal';
  const startDate = record?.cadastro.dadosGerais.vigenciaInicial || '15/03/2024';
  const endDate = record?.cadastro.dadosGerais.vigenciaFinal || '14/03/2026';
  const status = record?.cadastro.dadosGerais.status || 'Em execução';

  return (
    <section className="view plan-work-view">
      <header className="plan-work-head">
        <div className="plan-work-head__top">
          <div className="crumbs plan-work-crumbs">
            <span className="crumb">Início</span>
            <span className="crumb">{breadcrumb[0] ?? 'Convênios'}</span>
            <span className="crumb">{planNumber}</span>
            <span className="crumb is-current">Plano de Trabalho</span>
          </div>
          <div className="plan-work-user-actions">
            <button type="button" className="plan-work-round-button" aria-label="Notificações">
              <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
              <strong>12</strong>
            </button>
            <span className="plan-work-avatar" aria-label="Perfil">FC</span>
          </div>
        </div>

        <div className="plan-work-head__row">
          <div>
            <h2>{title.title}</h2>
            <p>Visualize, gerencie e acompanhe os itens e metas do plano de trabalho do instrumento.</p>
          </div>
          <div className="plan-work-actions">
            <button type="button" className="plan-work-button">
              <span className="material-symbols-outlined" aria-hidden="true">history</span>
              Histórico de versões
            </button>
            <button type="button" className="plan-work-button">
              <span className="material-symbols-outlined" aria-hidden="true">download</span>
              Exportar
              <span className="material-symbols-outlined" aria-hidden="true">expand_more</span>
            </button>
            <button type="button" className="plan-work-button plan-work-button--primary">
              <span className="material-symbols-outlined" aria-hidden="true">add</span>
              Novo item
            </button>
          </div>
        </div>
      </header>

      <section className="plan-work-contract-card" aria-label="Resumo do convênio">
        <article>
          <span className="material-symbols-outlined" aria-hidden="true">request_quote</span>
          <div>
            <small>Convênio</small>
            <strong>{planNumber}</strong>
            <em>{record?.cadastro.dadosGerais.instrumento || 'Implantação de Centro de Cidadania'}</em>
          </div>
        </article>
        <article>
          <span className="material-symbols-outlined" aria-hidden="true">account_balance</span>
          <div>
            <small>Concedente</small>
            <strong>{grantor.split(' - ')[0] || 'SEAP'}</strong>
            <em>{grantor}</em>
          </div>
        </article>
        <article>
          <span className="material-symbols-outlined" aria-hidden="true">groups</span>
          <div>
            <small>Convenente</small>
            <strong>{proponent}</strong>
            <em>{record?.cadastro.dadosGerais.eixo || 'Eixo em validação'}</em>
          </div>
        </article>
        <article>
          <span className="material-symbols-outlined" aria-hidden="true">event_available</span>
          <div>
            <small>Vigência do Convênio</small>
            <strong>{startDate} a {endDate}</strong>
            <mark>{status}</mark>
          </div>
        </article>
      </section>

      <section className="plan-work-kpi-strip" aria-label="Indicadores do plano">
        <article><span>Valor Global</span><strong>{currencyFormatter.format(summary?.valorTotalAutorizado ?? totalPlan)}</strong></article>
        <article><span>Total do Plano de Trabalho</span><strong>{currencyFormatter.format(totalPlan)}</strong></article>
        <article><span>Executado (acumulado)</span><strong className="is-success">{currencyFormatter.format(executedValue)} ({percentFormatter.format(executionPercent)}%)</strong></article>
        <article><span>Previsto (restante)</span><strong className="is-warning">{currencyFormatter.format(remainingValue)} ({percentFormatter.format(Math.max(0, 100 - executionPercent))}%)</strong></article>
        <article><span>Itens do Plano</span><strong>{rows.length}</strong></article>
        <article><span>Itens Concluídos</span><strong>{completedItems} ({rows.length ? Math.round((completedItems / rows.length) * 100) : 0}%)</strong></article>
      </section>

      <section className="plan-work-body">
        <article className="plan-work-table-card">
          <div className="plan-work-table-card__head">
            <h3>Itens do Plano de Trabalho</h3>
            <div className="plan-work-table-tools">
              <button type="button" className="plan-work-button plan-work-button--compact">
                <span className="material-symbols-outlined" aria-hidden="true">filter_alt</span>
                Filtros
              </button>
              <label className="plan-work-search">
                <span className="material-symbols-outlined" aria-hidden="true">search</span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Pesquisar item"
                />
              </label>
            </div>
          </div>

          <div className="plan-work-table-wrap">
            <table className="plan-work-table">
              <thead>
                <tr>
                  <th>Categoria/Objeto</th>
                  <th>Item</th>
                  <th>Quant.</th>
                  <th>V. Unitário</th>
                  <th>V. Total</th>
                  <th>Monitorado</th>
                  <th>Documento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, index) => (
                  <tr key={`${row.document}-${index}`}>
                    <td><span className={`plan-work-category ${planCategoryClass(row.category)}`}>{row.category}</span></td>
                    <td>
                      <div className="plan-work-item-cell">
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <strong>{row.item}</strong>
                      </div>
                    </td>
                    <td>{row.quantity}</td>
                    <td>{row.unitValue}</td>
                    <td>{row.totalValue}</td>
                    <td><span className={row.monitored === 'Sim' ? 'plan-work-status is-yes' : 'plan-work-status is-no'}>{String(row.monitored)}</span></td>
                    <td><a className="plan-work-doc" href="#documento">{row.document}</a></td>
                    <td>
                      <div className="plan-work-row-actions">
                        <button type="button" aria-label="Visualizar item"><span className="material-symbols-outlined" aria-hidden="true">visibility</span></button>
                        <button type="button" aria-label="Editar item"><span className="material-symbols-outlined" aria-hidden="true">edit</span></button>
                        <button type="button" aria-label="Mais ações"><span className="material-symbols-outlined" aria-hidden="true">more_vert</span></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="plan-work-table-footer">
            <span>Exibindo {filteredRows.length ? 1 : 0} a {filteredRows.length} de {rows.length} itens</span>
            <div>
              <button type="button" aria-label="Página anterior" disabled><span className="material-symbols-outlined" aria-hidden="true">chevron_left</span></button>
              <strong>1</strong>
              <button type="button" aria-label="Próxima página" disabled><span className="material-symbols-outlined" aria-hidden="true">chevron_right</span></button>
            </div>
          </footer>
        </article>

        <aside className="plan-work-side">
          <article className="plan-work-side-card">
            <div className="plan-work-side-card__head">
              <h3>Resumo do plano</h3>
              <select aria-label="Tipo de visão do resumo">
                <option>Visão geral</option>
              </select>
            </div>
            <div className="plan-work-donut-layout">
              <div
                className="plan-work-donut"
                style={{ '--plan-donut': donutStops } as CSSProperties}
                aria-label={`Total do plano ${currencyFormatter.format(totalPlan)}`}
              >
                <div>
                  <strong>{currencyFormatter.format(totalPlan)}</strong>
                  <span>Total do plano</span>
                </div>
              </div>
              <div className="plan-work-legend">
                {categoryEntries.map(([label, value], index) => (
                  <div key={label} className={`plan-work-legend__item ${planLegendClass(index)}`}>
                    <span>{label}</span>
                    <strong>{currencyFormatter.format(value)} ({percentFormatter.format(totalPlan ? (value / totalPlan) * 100 : 0)}%)</strong>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="plan-work-side-card">
            <h3>Indicadores de execução</h3>
            <dl className="plan-work-indicators">
              <div><dt>Avanço físico (percentual)</dt><dd className="is-success">{percentFormatter.format(executionPercent)}%</dd></div>
              <div><dt>Itens concluídos</dt><dd>{completedItems} de {rows.length}</dd></div>
              <div><dt>Itens em execução</dt><dd>{Math.max(rows.length - completedItems, 0)}</dd></div>
              <div><dt>Itens não iniciados</dt><dd>{rows.filter((row) => row.monitored !== 'Sim').length}</dd></div>
              <div><dt>Acompanhamentos realizados</dt><dd>{Math.max(completedItems + 2, 0)}</dd></div>
            </dl>
          </article>

          <article className="plan-work-side-card">
            <h3>Observações</h3>
            <p>A execução dos itens está sendo realizada conforme cronograma previsto. Próxima avaliação em 30/05/2025.</p>
            <p><strong>Responsável:</strong> Felipe Cabral<br /><strong>Atualizado em:</strong> {record ? formatDashboardUpdatedAt(record.updatedAt) : '20/05/2025 09:30'}</p>
          </article>
        </aside>
      </section>
    </section>
  );
}

function parsePlanMoney(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function buildPlanDonutStops(values: number[], total: number) {
  const colors = ['#0b72d9', '#2f9a57', '#e9ad16', '#6167d9', '#f06c27', '#9aa4b2'];
  if (!total || values.length === 0) return '#d9dee7 0 100%';
  let cursor = 0;
  return values
    .map((value, index) => {
      const start = cursor;
      const end = index === values.length - 1 ? 100 : cursor + (value / total) * 100;
      cursor = end;
      return `${colors[index % colors.length]} ${start}% ${end}%`;
    })
    .join(', ');
}

function planCategoryClass(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes('obra')) return 'is-works';
  if (normalized.includes('equip')) return 'is-equipment';
  if (normalized.includes('serv')) return 'is-service';
  if (normalized.includes('tecn')) return 'is-tech';
  if (normalized.includes('comun')) return 'is-communication';
  return 'is-muted';
}

function planLegendClass(index: number) {
  return ['is-blue', 'is-green', 'is-yellow', 'is-purple', 'is-orange', 'is-gray'][index % 6];
}

function ContractView({
  breadcrumb,
  title,
  record,
  documents,
  parties,
  onDraftChange,
  onDraftReplace,
  onRecordsChange,
}: {
  breadcrumb: string[];
  title: { title: string; subtitle: string; action: string };
  record: ProcessosRecord | null;
  documents: ViewData['contractDocuments'];
  parties: ViewData['contractParties'];
  onDraftChange: <K extends keyof ProcessoContratacaoForm>(field: K, value: ProcessoContratacaoForm[K]) => void;
  onDraftReplace: (draft: ProcessoContratacaoForm) => void;
  onRecordsChange: (records: ProcessoContratacaoRegistro[]) => void;
}) {
  const summary = documents[0];
  const leadParty = parties[0];
  const consolidated = record ? buildProcessoConsolidatedSummary(record) : null;

  return (
    <section className="view view--detail">
      <header className="detail-head">
        <div className="detail-head__copy">
          <div className="crumbs">
            {breadcrumb.map((item, index) => (
              <span key={item} className={index === breadcrumb.length - 1 ? 'crumb is-current' : 'crumb'}>
                {item}
              </span>
            ))}
          </div>
          <h2>{title.title}</h2>
        </div>
      </header>

      {record ? (
        <section className="process-module-summary">
          <article>
            <span>Autorizado no plano</span>
            <strong>{formatDashboardMetricValue(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(consolidated?.valorTotalAutorizado ?? 0))}</strong>
          </article>
          <article>
            <span>Contratado</span>
            <strong>{formatDashboardMetricValue(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(consolidated?.valorTotalContratado ?? 0))}</strong>
          </article>
          <article>
            <span>Saldo disponível</span>
            <strong>{formatDashboardMetricValue(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(consolidated?.saldoDisponivel ?? 0))}</strong>
          </article>
          <article>
            <span>Pago / OB</span>
            <strong>{formatDashboardMetricValue(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(consolidated?.valorTotalPago ?? 0))}</strong>
          </article>
        </section>
      ) : null}

      <section className="detail-layout">
        <div className="detail-main">
          <article className="detail-panel">
            <div className="section-kicker section-kicker--detail">Informações jurídicas e institucionais</div>
            <div className="detail-panel__grid">
              <div className="detail-panel__field detail-panel__field--wide">
                <span>{summary?.title || 'Sem dados carregados'}</span>
                <strong>{summary?.subtitle || 'A base fictícia foi zerada.'}</strong>
                <small>{leadParty ? `${leadParty.institution} · ${leadParty.representative}` : 'Selecione um instrumento para ver os detalhes.'}</small>
              </div>
            </div>
          </article>

          <article className="table-card">
            <div className="table-head">
              <div className="section-kicker">Partes intervenientes</div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>INSTITUICAO</th>
                    <th>CNPJ</th>
                    <th>PAPEL</th>
                    <th>REPRESENTANTE</th>
                  </tr>
                </thead>
                <tbody>
                  {parties.map((party) => (
                    <tr key={`${party.role}-${party.institution}`}>
                      <td>{party.institution}</td>
                      <td>{party.cnpj}</td>
                      <td>{party.role}</td>
                      <td>{party.representative}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <aside className="detail-side">
          <article className="detail-docs">
            <div className="section-kicker">Documentacao Essencial</div>
            <div className="checklist">
              {documents.map((item) => (
                <div key={item.title} className="checklist-item checklist-item--compact">
                  <span className={`check-icon tone-${item.tone}`} />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>

      {record ? (
        <section className="process-module-card">
          <ProcessoContratacaoStep
            draft={record.cadastro.processoContratacao}
            records={record.cadastro.processoContratacaoRegistros}
            planoItems={record.cadastro.planoTrabalho.itens}
            onDraftChange={onDraftChange}
            onDraftReplace={onDraftReplace}
            onRecordsChange={onRecordsChange}
            onClearDraft={() => onDraftReplace(createProcessoContratacaoDraft())}
          />
        </section>
      ) : (
        <section className="empty-module-state">
          <strong>Nenhum processo selecionado</strong>
          <p>Selecione um processo na lista para cadastrar contratações vinculadas ao Plano de Trabalho.</p>
        </section>
      )}
    </section>
  );
}

function ManagementView({
  breadcrumb,
  title,
  dashboardUpdatedAt,
  records,
  record,
  onGestaoChange,
}: {
  breadcrumb: string[];
  title: { title: string; subtitle: string; action: string };
  dashboardUpdatedAt: string;
  records: ProcessosRecord[];
  record: ProcessosRecord | null;
  onGestaoChange: <K extends keyof GestaoInstrumentoForm>(field: K, value: GestaoInstrumentoForm[K]) => void;
}) {
  const [sectorFilter, setSectorFilter] = useState('Todas as unidades');
  const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const sectorOptions = useMemo(
    () => ['Todas as unidades', ...cadastroOptionSets.unidadesSistema.map((option) => option.value)],
    [],
  );
  const filteredRecords = useMemo(
    () =>
      records.filter((recordItem) => {
        const dados = recordItem.cadastro.dadosGerais;
        const processo = recordItem.cadastro.processoContratacao;
        const unidade =
          processo.unidadeBeneficiada ||
          processo.localizacao ||
          processo.relatorioBeneficiados ||
          dados.setorCorrelacionado ||
          dados.eixo;
        return sectorFilter === 'Todas as unidades' || unidade === sectorFilter;
      }),
    [records, sectorFilter],
  );
  const metrics = buildDashboardMetrics(filteredRecords);
  const deadlines = buildDashboardDeadlines(filteredRecords);
  const alerts = buildDashboardAlerts(filteredRecords);
  const recentRows = buildDashboardRecentRows(filteredRecords);
  const summaries = filteredRecords.map(buildProcessoConsolidatedSummary);
  const totalAuthorized = summaries.reduce((sum, summary) => sum + summary.valorTotalAutorizado, 0);
  const totalContracted = summaries.reduce((sum, summary) => sum + summary.valorTotalContratado, 0);
  const totalExecuted = summaries.reduce((sum, summary) => sum + summary.valorTotalPago, 0);
  const totalToExecute = Math.max(totalContracted - totalExecuted, 0);
  const totalAvailable = Math.max(totalAuthorized - totalContracted, 0);
  const criticalDeadlines = deadlines.filter((deadline) => deadline.tone === 'critical').length;
  const warningDeadlines = deadlines.filter((deadline) => deadline.tone === 'warning').length;
  const activeProcesses = filteredRecords.filter((entry) => {
    const status = entry.cadastro.dadosGerais.status.toLowerCase();
    return status.includes('vigente') || status.includes('execu') || status.includes('andamento');
  }).length;
  const executionPercent = totalAuthorized > 0 ? Math.round((totalExecuted / totalAuthorized) * 100) : 0;
  const inProgressPercent = totalAuthorized > 0 ? Math.round((totalToExecute / totalAuthorized) * 100) : 0;
  const availablePercent = totalAuthorized > 0 ? Math.round((totalAvailable / totalAuthorized) * 100) : 0;
  const neutralPercent = Math.max(0, 100 - executionPercent - inProgressPercent - availablePercent);
  const onTrackCount = Math.max(filteredRecords.length - criticalDeadlines - warningDeadlines, 0);
  const pendingPrestacaoCount = warningDeadlines;
  const delayedPrestacaoCount = criticalDeadlines;
  const notStartedCount = Math.max(filteredRecords.filter((entry) => buildProcessoConsolidatedSummary(entry).valorTotalPago <= 0).length, 0);
  const prestacaoTotal = onTrackCount + pendingPrestacaoCount + delayedPrestacaoCount + notStartedCount;
  const onTrackPercent = prestacaoTotal > 0 ? Math.round((onTrackCount / prestacaoTotal) * 100) : 0;
  const pendingPrestacaoPercent = prestacaoTotal > 0 ? Math.round((pendingPrestacaoCount / prestacaoTotal) * 100) : 0;
  const delayedPrestacaoPercent = prestacaoTotal > 0 ? Math.round((delayedPrestacaoCount / prestacaoTotal) * 100) : 0;
  const notStartedPrestacaoPercent = Math.max(0, 100 - onTrackPercent - pendingPrestacaoPercent - delayedPrestacaoPercent);
  const metricHighlights = [
    {
      label: 'Processos ativos',
      value: String(activeProcesses || records.length),
      hint: `${records.length} cadastrados na base`,
      icon: 'description',
      tone: 'info',
    },
    {
      label: 'Vigências críticas',
      value: String(criticalDeadlines + warningDeadlines),
      hint: 'Próximos 120 dias',
      icon: 'event_repeat',
      tone: 'warning',
    },
    {
      label: 'Execução financeira',
      value: metrics[2]?.value ?? metrics[0]?.value ?? 'R$ 0,00',
      hint: metrics[2]?.hint ?? 'Carteira consolidada',
      icon: 'monetization_on',
      tone: 'success',
    },
    {
      label: 'Alertas',
      value: metrics[3]?.value ?? String(alerts.length),
      hint: 'Requerem atenção',
      icon: 'shield',
      tone: 'danger',
    },
  ];
  const financialLegend = [
    { label: 'Executado', value: totalExecuted, percent: executionPercent, tone: 'success' as const },
    { label: 'Em execução', value: totalToExecute, percent: inProgressPercent, tone: 'info' as const },
    { label: 'A executar', value: totalAvailable, percent: availablePercent, tone: 'warning' as const },
    { label: 'Residual', value: 0, percent: neutralPercent, tone: 'muted' as const },
  ];
  const prestacaoLegend = [
    { label: 'Em dia', value: onTrackCount, percent: onTrackPercent, tone: 'success' as const },
    { label: 'Pendente', value: pendingPrestacaoCount, percent: pendingPrestacaoPercent, tone: 'warning' as const },
    { label: 'Em atraso', value: delayedPrestacaoCount, percent: delayedPrestacaoPercent, tone: 'danger' as const },
    { label: 'Não iniciado', value: notStartedCount, percent: notStartedPrestacaoPercent, tone: 'muted' as const },
  ];

  function renderRecentProcessId(id: string) {
    const parts = id.split('-').filter(Boolean);
    if (parts.length <= 2) {
      return <span>{id}</span>;
    }

    const splitPoint = Math.ceil(parts.length / 2);
    const topLine = parts.slice(0, splitPoint).join('-');
    const bottomLine = parts.slice(splitPoint).join('-');

    return (
      <span className="recent-process-id" title={id}>
        <span className="recent-process-id__line">{topLine}</span>
        <span className="recent-process-id__line">{bottomLine}</span>
      </span>
    );
  }

  return (
    <section className="view dashboard-page">
      <header className="dashboard-head dashboard-head--reference">
        <div className="dashboard-head__topline">
          <div className="crumbs dashboard-crumbs">
            {breadcrumb.map((item, index) => (
              <span key={item} className={index === breadcrumb.length - 1 ? 'crumb is-current' : 'crumb'}>
                {item}
              </span>
            ))}
          </div>
          <div className="dashboard-toolbar" aria-label="Filtros do painel">
            <button type="button" className="dashboard-toolbar__control">
              <span className="material-symbols-outlined" aria-hidden="true">
                calendar_month
              </span>
              2026
              <span className="material-symbols-outlined" aria-hidden="true">
                expand_more
              </span>
            </button>
            <label className="dashboard-toolbar__control dashboard-toolbar__control--select">
              <span className="material-symbols-outlined" aria-hidden="true">
                account_balance
              </span>
              <span>Unidades</span>
              <select value={sectorFilter} onChange={(event) => setSectorFilter(event.target.value)} aria-label="Filtrar por unidade">
                {sectorOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.replace('Todas as unidades', 'Todos')}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined" aria-hidden="true">
                expand_more
              </span>
            </label>
            <button type="button" className="dashboard-toolbar__icon" aria-label="Notificações">
              <span className="material-symbols-outlined" aria-hidden="true">
                notifications
              </span>
              <strong>{alerts.length}</strong>
            </button>
          </div>
        </div>
        <div className="dashboard-head__row">
          <div className="dashboard-head__copy">
            <h2>{title.title}</h2>
            <p>{title.subtitle}</p>
          </div>
          <span className="dashboard-head__updated">
            Última atualização: {dashboardUpdatedAt}
            <span className="material-symbols-outlined" aria-hidden="true">
              refresh
            </span>
          </span>
        </div>
      </header>

      <section className="dashboard-reference-metrics" aria-label="Resumo gerencial">
        {metricHighlights.map((metric) => (
          <article key={metric.label} className={`dashboard-reference-metric dashboard-reference-metric--${metric.tone}`}>
            <span className="dashboard-reference-metric__icon material-symbols-outlined" aria-hidden="true">
              {metric.icon}
            </span>
            <div>
              <p>{metric.label}</p>
              <strong title={metric.value}>{formatDashboardMetricValue(metric.value)}</strong>
              <small>{metric.hint}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-reference-grid">
        <article className="dashboard-reference-card dashboard-reference-card--deadlines">
          <div className="dashboard-reference-card__head">
            <h3>Vigências críticas (próximos 90 dias)</h3>
          </div>
          <div className="dashboard-reference-deadlines">
            {deadlines.length ? deadlines.map((row) => (
              <div key={row.id} className={`dashboard-reference-deadline dashboard-reference-deadline--${row.tone}`}>
                <strong>{row.vigency}</strong>
                <span aria-hidden="true" />
                <div>
                  <b>{row.id}</b>
                  <small>{row.object}</small>
                </div>
                <em>{row.deadlineDays === null ? 'A definir' : `${Math.abs(row.deadlineDays)} dias`}</em>
              </div>
            )) : <div className="dashboard-reference-empty">Nenhum processo encontrado para a unidade selecionada.</div>}
          </div>
          <button type="button" className="dashboard-reference-link">
            Ver todas as vigências
          </button>
        </article>

        <article className="dashboard-reference-card dashboard-reference-card--financial">
          <div className="dashboard-reference-card__head">
            <h3>Execução financeira</h3>
          </div>
          <div className="dashboard-donut-layout">
            <div
              className="dashboard-reference-donut dashboard-reference-donut--financial"
              style={
                {
                  '--donut-a': `${executionPercent}%`,
                  '--donut-b': `${executionPercent + inProgressPercent}%`,
                  '--donut-c': `${executionPercent + inProgressPercent + availablePercent}%`,
                } as CSSProperties
              }
              aria-label={`Execução financeira ${executionPercent}%`}
            >
              <div>
                <strong>{formatDashboardMetricValue(currencyFormatter.format(totalExecuted))}</strong>
                <span>Executado</span>
              </div>
            </div>
            <div className="dashboard-reference-legend dashboard-reference-legend--financial">
              {financialLegend.map((item) => (
                <div key={item.label} className={`dashboard-reference-legend__item dashboard-reference-legend__item--${item.tone}`}>
                  <div className="dashboard-reference-legend__label">
                    <span>{item.label}</span>
                  </div>
                  <div className="dashboard-reference-legend__metric">
                    <strong>{formatDashboardMetricValue(currencyFormatter.format(item.value))}</strong>
                    <small>{item.percent}%</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button type="button" className="dashboard-reference-link">
            Ver relatório financeiro
          </button>
        </article>

        <article className="dashboard-reference-card dashboard-reference-card--prestacao">
          <div className="dashboard-reference-card__head">
            <h3>Prestação de Contas</h3>
          </div>
          <div className="dashboard-donut-layout dashboard-donut-layout--compact">
            <div
              className="dashboard-reference-donut dashboard-reference-donut--prestacao"
              style={
                {
                  '--donut-a': `${onTrackPercent}%`,
                  '--donut-b': `${onTrackPercent + pendingPrestacaoPercent}%`,
                  '--donut-c': `${onTrackPercent + pendingPrestacaoPercent + delayedPrestacaoPercent}%`,
                } as CSSProperties
              }
              aria-label={`Prestação em dia ${onTrackPercent}%`}
            >
              <div>
                <strong>{onTrackPercent}%</strong>
                <span>Em dia</span>
              </div>
            </div>
            <div className="dashboard-reference-legend dashboard-reference-legend--status">
              {prestacaoLegend.map((item) => (
                <div key={item.label} className={`dashboard-reference-legend__item dashboard-reference-legend__item--${item.tone}`}>
                  <div className="dashboard-reference-legend__label">
                    <span>{item.label}</span>
                  </div>
                  <div className="dashboard-reference-legend__metric">
                    <strong>{item.value}</strong>
                    <small>{item.percent}%</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button type="button" className="dashboard-reference-link">
            Ver todas as prestações
          </button>
        </article>
      </section>

      <section className="dashboard-reference-lower">
        <article className="dashboard-table-card dashboard-table-card--recent dashboard-reference-card">
          <div className="dashboard-table-card__head">
            <div>
              <h3>Processos recentes</h3>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table dashboard-table">
              <thead>
                <tr>
                  <th>Nº do Processo</th>
                  <th>Instrumento</th>
                  <th>Órgão / Entidade</th>
                  <th>Objeto</th>
                  <th>Valor</th>
                  <th>Situação</th>
                  <th>Atualizado em</th>
                </tr>
              </thead>
              <tbody>
                  {recentRows.length ? recentRows.map((row) => (
                    <tr key={row.id}>
                    <td>
                      <div className="item-title">{renderRecentProcessId(row.ref || row.id)}</div>
                    </td>
                    <td className="td-muted">{row.title}</td>
                    <td className="td-muted">{row.sector}</td>
                    <td>{row.subtitle}</td>
                    <td className="td-strong">{formatDashboardMetricValue(row.amount)}</td>
                    <td>
                      <span className={`badge dashboard-status-badge badge--${row.statusTone}`} title={row.status}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.vigency}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="dashboard-table__empty">Nenhum processo encontrado para a unidade selecionada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          <button type="button" className="dashboard-reference-link dashboard-reference-link--table">
            Ver todos os processos
          </button>
        </article>

        <aside className="dashboard-reference-side">
          <article className="dashboard-reference-card dashboard-reference-card--alerts">
            <div className="dashboard-panel__head">
              <div>
                <h3>Alertas e Riscos</h3>
              </div>
            </div>
            <div className="dashboard-reference-alerts">
              {alerts.map((item) => (
                <div key={item.title} className={`dashboard-reference-alert dashboard-reference-alert--${item.tone}`}>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    {item.tone === 'critical' ? 'warning' : item.tone === 'warning' ? 'error' : 'info'}
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.detail}</small>
                  </div>
                  <em>{item.meta}</em>
                </div>
              ))}
            </div>
            <button type="button" className="dashboard-reference-link">
              Ver todos os alertas
            </button>
          </article>

          <article className="dashboard-reference-card dashboard-reference-card--quick">
            <h3>Ações rápidas</h3>
            <div className="dashboard-quick-actions">
              {[
                ['note_add', 'Novo Convênio'],
                ['handshake', 'Novo Instrumento'],
                ['fact_check', 'Nova Prestação de Contas'],
                ['report', 'Registrar Risco'],
              ].map(([icon, label]) => (
                <button key={label} type="button" className="dashboard-quick-action">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    {icon}
                  </span>
                  <strong>{label}</strong>
                </button>
              ))}
            </div>
          </article>
        </aside>
      </section>

      {record ? (
        <section className="process-module-card process-module-card--embedded">
          <div className="process-module-card__head">
            <div>
              <div className="section-kicker">Módulo do processo selecionado</div>
              <h3>Gestão do Instrumento</h3>
              <p>Controle operacional de publicação, fiscalização, prorrogação, suplementação e prestação de gestão.</p>
            </div>
            <strong>{recordTitle(record)}</strong>
          </div>
          <GestaoInstrumentoStep data={record.cadastro.gestaoInstrumento} onChange={onGestaoChange} />
        </section>
      ) : null}

    </section>
  );
}

function formatDashboardMetricValue(value: string) {
  if (!value.startsWith('R$')) return value;

  const digits = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const numeric = Number(digits);

  if (!Number.isFinite(numeric) || numeric < 1000000) return value;

  const millionValue = numeric / 1000000;
  return `R$ ${millionValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}M`;
}

function formatDashboardUpdatedAt(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'data indisponível';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function RecordViewerModal({
  record,
  onClose,
}: {
  record: ProcessosRecord;
  onClose: () => void;
}) {
  const cadastro = record.cadastro;
  const prestacao = cadastro.prestacaoContas;
  const prestacaoItems = prestacao?.itens ?? [];
  const prestacaoGlobal = prestacao
    ? (({ itens, ...rest }: typeof prestacao) => rest)(prestacao)
    : ({} as Record<string, never>);

  return (
    <div className="record-viewer" role="dialog" aria-modal="true" aria-label={`Visualização de ${record.id}`}>
      <div className="record-viewer__backdrop" onClick={onClose} aria-hidden="true" />
      <article className="record-viewer__panel">
        <header className="record-viewer__head">
          <div>
            <span className="section-kicker">Visualização completa</span>
            <h3>{record.cadastro.dadosGerais.numeroInternoSeap || record.id}</h3>
            <p>{record.cadastro.dadosGerais.instrumento || 'Instrumento cadastrado'}</p>
          </div>
          <button type="button" className="icon-action record-viewer__close" onClick={onClose} aria-label="Fechar visualização">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="record-viewer__body">
          <section className="record-viewer__section">
            <h4>Dados Gerais</h4>
            <div className="record-viewer__grid">
              {entriesForDisplay(cadastro.dadosGerais).map(([key, value]) => (
                <dl key={key} className="record-field">
                  <dt>{formatFieldLabel(key)}</dt>
                  <dd>{formatFieldValue(value)}</dd>
                </dl>
              ))}
            </div>
          </section>

          <section className="record-viewer__section">
            <h4>Plano de Trabalho</h4>
            <div className="record-viewer__cards">
              {cadastro.planoTrabalho.itens.length ? (
                cadastro.planoTrabalho.itens.map((item) => (
                  <article key={item.id} className="record-viewer__item">
                    <strong>{item.item}</strong>
                    <div className="record-viewer__grid record-viewer__grid--compact">
                      {entriesForDisplay(item)
                        .filter(([key]) => key !== 'id')
                        .map(([key, value]) => (
                          <dl key={key} className="record-field">
                            <dt>{formatFieldLabel(key)}</dt>
                            <dd>{formatFieldValue(value)}</dd>
                          </dl>
                        ))}
                    </div>
                  </article>
                ))
              ) : (
                <p className="record-viewer__empty">Nenhum item cadastrado no plano.</p>
              )}
            </div>
          </section>

          <section className="record-viewer__section">
            <h4>Processo de Contratação</h4>
            <div className="record-viewer__grid">
              {entriesForDisplay(cadastro.processoContratacao).map(([key, value]) => (
                <dl key={key} className="record-field">
                  <dt>{formatFieldLabel(key)}</dt>
                  <dd>{formatFieldValue(value)}</dd>
                </dl>
              ))}
            </div>
          </section>

          <section className="record-viewer__section">
            <h4>Gestão de Instrumento</h4>
            <div className="record-viewer__grid">
              {entriesForDisplay(cadastro.gestaoInstrumento).map(([key, value]) => (
                <dl key={key} className="record-field">
                  <dt>{formatFieldLabel(key)}</dt>
                  <dd>{formatFieldValue(value)}</dd>
                </dl>
              ))}
            </div>
          </section>

          <section className="record-viewer__section">
            <h4>Prestação de Contas</h4>
            <div className="record-viewer__grid">
              {entriesForDisplay(prestacaoGlobal).map(([key, value]) => (
                <dl key={key} className="record-field">
                  <dt>{formatFieldLabel(key)}</dt>
                  <dd>{formatFieldValue(value)}</dd>
                </dl>
              ))}
            </div>

            <div className="record-viewer__cards">
              {prestacaoItems.length ? (
                prestacaoItems.map((item) => (
                  <article key={item.itemPlanoId} className="record-viewer__item">
                    <strong>{item.itemPlanoDescricao || item.itemPlanoId}</strong>
                    <div className="record-viewer__grid record-viewer__grid--compact">
                      <dl className="record-field">
                        <dt>Status</dt>
                        <dd>{formatFieldValue(item.statusItemPrestacao)}</dd>
                      </dl>
                      <dl className="record-field">
                        <dt>Executado</dt>
                        <dd>{formatFieldValue(item.valorExecutadoItem)}</dd>
                      </dl>
                      <dl className="record-field">
                        <dt>Comprovado</dt>
                        <dd>{formatFieldValue(item.valorComprovadoItem)}</dd>
                      </dl>
                      <dl className="record-field">
                        <dt>Glosado</dt>
                        <dd>{formatFieldValue(item.valorGlosadoItem)}</dd>
                      </dl>
                      <dl className="record-field">
                        <dt>Saldo não utilizado</dt>
                        <dd>{formatFieldValue(item.saldoNaoUtilizadoItem)}</dd>
                      </dl>
                      <dl className="record-field">
                        <dt>Pendencia</dt>
                        <dd>{formatFieldValue(item.pendenciaDocumentalItem)}</dd>
                      </dl>
                    </div>
                  </article>
                ))
              ) : (
                <p className="record-viewer__empty">Nenhum item de prestação foi consolidado ainda.</p>
              )}
            </div>
          </section>

          <section className="record-viewer__section record-viewer__section--muted">
            <h4>Ajuste de Plano de Trabalho</h4>
            <div className="record-viewer__grid">
              {entriesForDisplay(cadastro.ajustePt).map(([key, value]) => (
                <dl key={key} className="record-field">
                  <dt>{formatFieldLabel(key)}</dt>
                  <dd>{formatFieldValue(value)}</dd>
                </dl>
              ))}
            </div>
          </section>

          <section className="record-viewer__section">
            <h4>Documentos</h4>
            <div className="record-viewer__grid">
              {entriesForDisplay(cadastro.documentos).map(([key, value]) => (
                <dl key={key} className="record-field">
                  <dt>{formatFieldLabel(key)}</dt>
                  <dd>{formatFieldValue(value)}</dd>
                </dl>
              ))}
            </div>
          </section>

          <section className="record-viewer__section">
            <h4>Filtros Gerenciais</h4>
            <div className="record-viewer__grid">
              {entriesForDisplay(cadastro.filtros).map(([key, value]) => (
                <dl key={key} className="record-field">
                  <dt>{formatFieldLabel(key)}</dt>
                  <dd>{formatFieldValue(value)}</dd>
                </dl>
              ))}
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}

function entriesForDisplay(value: Record<string, string> | Record<string, never>) {
  return Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== '');
}

function formatFieldLabel(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/([_-])/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\bSeap\b/g, 'SEAP')
    .replace(/\bPt\b/g, 'PT')
    .replace(/\bNe\b/g, 'NE')
    .replace(/\bOb\b/g, 'OB')
    .trim();
}

function formatFieldValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : '—';
  }

  if (value && typeof value === 'object') {
    return JSON.stringify(value);
  }

  return value ? String(value) : '—';
}

function AdjustmentView({
  breadcrumb,
  title,
  agendaCards,
  record,
  onChange,
}: {
  breadcrumb: string[];
  title: { title: string; subtitle: string; action: string };
  agendaCards: ViewData['agendaCards'];
  record: ProcessosRecord | null;
  onChange: <K extends keyof AjustePtForm>(field: K, value: AjustePtForm[K]) => void;
}) {
  return (
    <section className="view">
      <SectionHeader breadcrumb={breadcrumb} title={title.title} subtitle={title.subtitle} action={title.action} />
      <section className="notice-grid">
        <article className="side-card">
          <h3>Ajustes aprovados</h3>
          <div className="event-list">
            {agendaCards.map((item) => (
              <div key={item.title} className="event-item">
                <span className={`event-dot tone-${item.tone}`} />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.due}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
      {record ? (
        <section className="process-module-card">
          <div className="process-module-card__head">
            <div>
              <div className="section-kicker">Módulo operacional</div>
              <h3>Ajuste do Plano de Trabalho</h3>
              <p>Registre solicitações, autorização, documento autorizador e impacto financeiro sobre o plano aprovado.</p>
            </div>
            <strong>{recordTitle(record)}</strong>
          </div>
          <AjustePtStep data={record.cadastro.ajustePt} onChange={onChange} />
        </section>
      ) : null}
    </section>
  );
}

function PrestacaoView({
  breadcrumb,
  title,
  record,
  onBack,
}: {
  breadcrumb: string[]; 
  title: { title: string; subtitle: string; action: string };
  record: ProcessosRecord | null;
  onBack: () => void;
}) {
  const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const percentFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const prestacaoItems = useMemo(() => syncPrestacaoItemsForRecord(record), [record]);
  const summary = record ? buildProcessoConsolidatedSummary(record) : null;
  const dados = record?.cadastro.dadosGerais;
  const prestacao = record?.cadastro.prestacaoContas;
  const processNumber = dados?.numeroInternoSeap || dados?.numeroInstrumento || record?.id || '012/2023';
  const processTitle = dados?.instrumento || 'Implantação de Centro de Cidadania';
  const convenente = dados?.setorCorrelacionado || 'Prefeitura Municipal de Natal';
  const valorGlobal = summary?.valorTotalAutorizado ?? parsePlanMoney(dados?.valorGlobal || 'R$ 0,00');
  const valorExecutado = summary?.valorTotalPago ?? prestacaoItems.reduce((sum, item) => sum + parsePlanMoney(item.valorExecutadoItem), 0);
  const saldoAtual = Math.max(valorGlobal - valorExecutado, 0);
  const execPercent = valorGlobal > 0 ? (valorExecutado / valorGlobal) * 100 : 0;
  const documentChecklist = useMemo(() => buildPrestacaoChecklistEntries(record, prestacaoItems), [record, prestacaoItems]);
  const docsProgress = useMemo(() => {
    const weighted = documentChecklist.reduce((sum, item) => sum + (item.status === 'Enviado' ? 1 : item.status === 'Parcial' ? 0.5 : 0), 0);
    return documentChecklist.length ? Math.round((weighted / documentChecklist.length) * 100) : 0;
  }, [documentChecklist]);
  const sentDocuments = documentChecklist.filter((item) => item.status === 'Enviado').length;
  const pendingDocuments = documentChecklist.filter((item) => item.status !== 'Enviado').length;
  const itemRows = useMemo(() => {
    return prestacaoItems.map((item) => {
      const previsto = parsePlanMoney(item.valorTotalPrevisto);
      const executado = parsePlanMoney(item.valorExecutadoItem);
      const saldo = Math.max(previsto - executado, 0);
      const percentual = previsto > 0 ? (executado / previsto) * 100 : 0;
      const tone = prestacaoRowTone(item.statusItemPrestacao, percentual, item);
      return {
        id: item.itemPlanoId,
        titulo: item.itemPlanoDescricao,
        previsto,
        executado,
        saldo,
        percentual,
        tone: tone as 'success' | 'warning' | 'danger',
      };
    });
  }, [prestacaoItems]);
  const totalPrevistoItens = itemRows.reduce((sum, item) => sum + item.previsto, 0);
  const totalExecutadoItens = itemRows.reduce((sum, item) => sum + item.executado, 0);
  const totalSaldoItens = itemRows.reduce((sum, item) => sum + item.saldo, 0);
  const docsSummaryRows = buildPrestacaoDocumentSummary(documentChecklist);
  const criticalPendings = buildPrestacaoPendings(documentChecklist, prestacaoItems);
  const progressLegend = buildPrestacaoProgressLegend(itemRows, pendingDocuments);
  const completionPercent = Math.round(Math.max(0, Math.min(100, (execPercent * 0.65) + (docsProgress * 0.35))));
  const progressDonut = buildPrestacaoProgressDonut(progressLegend);
  const accountBalance = parsePlanMoney(dados?.saldoConta || currencyFormatter.format(saldoAtual));
  const latestUpdate = record ? formatDashboardUpdatedAt(record.updatedAt) : '20/05/2025 09:45';
  const yearLabel = record?.createdAt ? new Date(record.createdAt).getFullYear() : 2025;
  const sideSteps = [
    { href: '#prestacao-resumo', label: 'Resumo', hint: 'Visão geral da prestação', icon: 'info' },
    { href: '#prestacao-itens', label: 'Itens', hint: 'Execução por item de despesa', icon: 'add_circle' },
    { href: '#prestacao-documentos', label: 'Documentos', hint: 'Comprovações e anexos', icon: 'description' },
    { href: '#prestacao-conciliacao', label: 'Conciliação', hint: 'Financeira', icon: 'sync_alt' },
    { href: '#prestacao-encerramento', label: 'Encerramento', hint: 'Conclusão da prestação', icon: 'task_alt' },
  ];

  return (
    <section className="view prestacao-reference-page">
      <header className="prestacao-reference-head">
        <div className="prestacao-reference-head__top">
          <div className="crumbs prestacao-reference-crumbs">
            <span className="crumb">Início</span>
            <span className="crumb">{breadcrumb[breadcrumb.length - 1] ?? 'Prestação de Contas'}</span>
            <span className="crumb is-current">{processNumber}</span>
          </div>
          <div className="prestacao-reference-head__actions">
            <button type="button" className="prestacao-reference-filter">
              <span className="material-symbols-outlined" aria-hidden="true">calendar_month</span>
              {yearLabel}
              <span className="material-symbols-outlined" aria-hidden="true">expand_more</span>
            </button>
            <button type="button" className="prestacao-reference-circle" aria-label="Ajuda">
              <span className="material-symbols-outlined" aria-hidden="true">help</span>
            </button>
            <button type="button" className="prestacao-reference-circle prestacao-reference-circle--notify" aria-label="Notificações">
              <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
              <strong>12</strong>
            </button>
            <span className="prestacao-reference-avatar">FC</span>
          </div>
        </div>

        <div className="prestacao-reference-head__row">
          <div>
            <h2>{title.title}</h2>
            <p>Acompanhe a execução financeira, documentos e pendências para encerramento da prestação.</p>
          </div>
          <div className="prestacao-reference-head__meta">
            <span>Última atualização: {latestUpdate}</span>
            <button type="button" aria-label="Atualizar">
              <span className="material-symbols-outlined" aria-hidden="true">refresh</span>
            </button>
          </div>
        </div>
      </header>

      {record ? (
        <section className="prestacao-reference-layout">
          <aside className="prestacao-reference-left">
            <button type="button" className="prestacao-reference-back" onClick={onBack}>
              <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
              Voltar para lista
            </button>

            <article className="prestacao-reference-process-card">
              <span>Processo</span>
              <h3>{processNumber}</h3>
              <mark>{dados?.status || 'Em execução'}</mark>
              <dl>
                <div><dt>Convênio</dt><dd>{processTitle}</dd></div>
                <div><dt>Convenente</dt><dd>{convenente}</dd></div>
                <div><dt>Valor Global</dt><dd>{currencyFormatter.format(valorGlobal)}</dd></div>
                <div><dt>Vigência</dt><dd>{dados?.vigenciaInicial || '-'} a {dados?.vigenciaFinal || '-'}</dd></div>
              </dl>
            </article>

            <nav className="prestacao-reference-local-nav" aria-label="Navegação interna da prestação">
              {sideSteps.map((step, index) => (
                <a key={step.href} href={step.href} className={index === 0 ? 'is-active' : ''}>
                  <span className="material-symbols-outlined" aria-hidden="true">{step.icon}</span>
                  <div>
                    <strong>{step.label}</strong>
                    <small>{step.hint}</small>
                  </div>
                </a>
              ))}
            </nav>
          </aside>

          <div className="prestacao-reference-main">
            <section id="prestacao-resumo" className="prestacao-reference-card">
              <div className="prestacao-reference-card__head">
                <h3>Resumo operacional</h3>
              </div>
              <div className="prestacao-reference-metrics">
                <article className="prestacao-reference-metric is-success">
                  <span className="material-symbols-outlined" aria-hidden="true">monetization_on</span>
                  <div><small>Valor executado</small><strong>{currencyFormatter.format(valorExecutado)}</strong><em>{percentFormatter.format(execPercent)}% do valor global</em></div>
                </article>
                <article className="prestacao-reference-metric is-warning">
                  <span className="material-symbols-outlined" aria-hidden="true">account_balance_wallet</span>
                  <div><small>Saldo</small><strong>{currencyFormatter.format(saldoAtual)}</strong><em>{percentFormatter.format(Math.max(0, 100 - execPercent))}% do valor global</em></div>
                </article>
                <article className="prestacao-reference-metric is-info">
                  <span className="material-symbols-outlined" aria-hidden="true">description</span>
                  <div><small>Documentos</small><strong>{sentDocuments} / {documentChecklist.length}</strong><em>{docsProgress}% enviados</em></div>
                </article>
                <article className="prestacao-reference-metric is-danger">
                  <span className="material-symbols-outlined" aria-hidden="true">warning</span>
                  <div><small>Pendências</small><strong>{pendingDocuments}</strong><em>Requerem atenção</em></div>
                </article>
              </div>
            </section>

            <section id="prestacao-itens" className="prestacao-reference-card">
              <div className="prestacao-reference-card__head">
                <h3>Itens</h3>
              </div>
              <div className="prestacao-reference-table-wrap">
                <table className="prestacao-reference-table">
                  <thead>
                    <tr>
                      <th>Item de despesa</th>
                      <th>Previsto (R$)</th>
                      <th>Executado (R$)</th>
                      <th>Saldo (R$)</th>
                      <th>% Execução</th>
                      <th>Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemRows.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}. {item.titulo}</td>
                        <td>{currencyFormatter.format(item.previsto)}</td>
                        <td>{currencyFormatter.format(item.executado)}</td>
                        <td>{currencyFormatter.format(item.saldo)}</td>
                        <td>
                          <div className="prestacao-reference-progress-row">
                            <span className={`prestacao-reference-progress-bar is-${item.tone}`}>
                              <i style={{ width: `${Math.max(0, Math.min(100, item.percentual))}%` }} />
                            </span>
                            <strong>{percentFormatter.format(item.percentual)}%</strong>
                          </div>
                        </td>
                        <td><span className={`prestacao-reference-status is-${item.tone}`}>{prestacaoRowLabel(item.tone)}</span></td>
                      </tr>
                    ))}
                    <tr className="is-total">
                      <td>Total</td>
                      <td>{currencyFormatter.format(totalPrevistoItens)}</td>
                      <td>{currencyFormatter.format(totalExecutadoItens)}</td>
                      <td>{currencyFormatter.format(totalSaldoItens)}</td>
                      <td>{percentFormatter.format(totalPrevistoItens > 0 ? (totalExecutadoItens / totalPrevistoItens) * 100 : 0)}%</td>
                      <td>—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <a className="prestacao-reference-link" href="#prestacao-documentos">Ver detalhamento por item</a>
            </section>

            <div className="prestacao-reference-bottom">
              <section id="prestacao-documentos" className="prestacao-reference-card">
                <div className="prestacao-reference-card__head">
                  <h3>Documentos comprobatórios</h3>
                </div>
                <div className="prestacao-reference-table-wrap">
                  <table className="prestacao-reference-table prestacao-reference-table--docs">
                    <thead>
                      <tr>
                        <th>Tipo de documento</th>
                        <th>Obrigatório</th>
                        <th>Enviados</th>
                        <th>Situação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {docsSummaryRows.map((row) => (
                        <tr key={row.label}>
                          <td>{row.label}</td>
                          <td>{row.required}</td>
                          <td>{row.sent}</td>
                          <td><span className={`prestacao-reference-status is-${row.tone}`}>{row.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <a className="prestacao-reference-link" href="#prestacao-encerramento">Gerenciar documentos</a>
              </section>

              <section id="prestacao-conciliacao" className="prestacao-reference-card">
                <div className="prestacao-reference-card__head">
                  <h3>Conciliação financeira</h3>
                </div>
                <dl className="prestacao-reference-financial">
                  <div><dt>Saldo da conta específica (extrato)</dt><dd>{currencyFormatter.format(accountBalance || saldoAtual)}</dd></div>
                  <div><dt>(-) Créditos não identificados</dt><dd>{currencyFormatter.format(0)}</dd></div>
                  <div><dt>(-) Débitos não identificados</dt><dd>{currencyFormatter.format(0)}</dd></div>
                  <div className="is-total"><dt>(=) Saldo conciliado</dt><dd>{currencyFormatter.format(accountBalance || saldoAtual)}</dd></div>
                </dl>
                <div className="prestacao-reference-note is-success">
                  <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                  <div>
                    <strong>Conciliação realizada em {latestUpdate}</strong>
                    <small>Por {prestacao?.responsavelPrestacao || 'Felipe Cabral'}</small>
                  </div>
                </div>
                <a className="prestacao-reference-link" href="#prestacao-encerramento">Ver conciliações anteriores</a>
              </section>
            </div>

            <div id="prestacao-encerramento" className="prestacao-reference-inline-note">
              <span className="material-symbols-outlined" aria-hidden="true">info</span>
              <p>Após finalizar, a prestação será enviada para análise da área técnica responsável.</p>
            </div>
          </div>

          <aside className="prestacao-reference-right">
            <section className="prestacao-reference-card">
              <div className="prestacao-reference-card__head">
                <h3>Checklist documental</h3>
              </div>
              <div className="prestacao-reference-checklist-head">
                <strong>{sentDocuments} de {documentChecklist.length} documentos enviados</strong>
                <div className="prestacao-reference-progress-line"><i style={{ width: `${docsProgress}%` }} /></div>
                <span>{docsProgress}%</span>
              </div>
              <div className="prestacao-reference-checklist">
                {documentChecklist.map((item) => (
                  <div key={item.title} className="prestacao-reference-checklist__item">
                    <span className={`prestacao-reference-dot is-${item.tone}`} />
                    <strong>{item.title}</strong>
                    <em className={`is-${item.tone}`}>{item.status}</em>
                  </div>
                ))}
              </div>
              <a className="prestacao-reference-link" href="#prestacao-documentos">Ver todos os documentos</a>
            </section>

            <section className="prestacao-reference-card">
              <div className="prestacao-reference-card__head">
                <h3>Pendências críticas</h3>
                <span className="prestacao-reference-pill">{criticalPendings.length} pendências</span>
              </div>
              <div className="prestacao-reference-pending-list">
                {criticalPendings.map((item) => (
                  <div key={item.title} className="prestacao-reference-pending">
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.detail}</small>
                    </div>
                    <span>{item.deadline}</span>
                  </div>
                ))}
              </div>
              <a className="prestacao-reference-link" href="#prestacao-encerramento">Ver todas as pendências</a>
            </section>

            <section className="prestacao-reference-card">
              <div className="prestacao-reference-card__head">
                <h3>Progresso da prestação</h3>
              </div>
              <div className="prestacao-reference-donut-layout">
                <div className="prestacao-reference-donut" style={{ '--prestacao-donut': progressDonut } as CSSProperties}>
                  <div>
                    <strong>{completionPercent}%</strong>
                    <span>Concluído</span>
                  </div>
                </div>
                <div className="prestacao-reference-donut-legend">
                  {progressLegend.map((item) => (
                    <div key={item.label}>
                      <span><i className={`is-${item.tone}`} />{item.label}</span>
                      <strong>{item.percent}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <button type="button" className="prestacao-reference-finalize">
              <span className="material-symbols-outlined" aria-hidden="true">task_alt</span>
              <div>
                <strong>{title.action}</strong>
                <small>Encerrar e enviar para análise</small>
              </div>
            </button>
          </aside>
        </section>
      ) : (
        <article className="empty-module-state">
          <strong>Nenhum processo selecionado</strong>
          <p>Selecione um instrumento em Processos para lançar débitos e fechar a prestação por item.</p>
        </article>
      )}
    </section>
  );
}

function buildPrestacaoChecklistEntries(record: ProcessosRecord | null, items: PrestacaoItemForm[]) {
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

function prestacaoRowTone(status: string, percentual: number, item: PrestacaoItemForm) {
  const normalized = status.toLowerCase();
  const hasDocs = Boolean(item.notaFiscalItem || item.reciboItem || item.relatorioExecucaoItem);
  if (normalized.includes('comprov') || normalized.includes('encerr') || (percentual >= 70 && hasDocs)) return 'success';
  if (normalized.includes('pend') || percentual === 0) return 'danger';
  return 'warning';
}

function prestacaoRowLabel(tone: 'success' | 'warning' | 'danger') {
  if (tone === 'success') return 'Em dia';
  if (tone === 'warning') return 'Atenção';
  return 'Pendente';
}

function buildPrestacaoDocumentSummary(
  checklist: Array<{ title: string; status: 'Enviado' | 'Parcial' | 'Pendência'; tone: 'success' | 'warning' | 'danger' }>,
) {
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

function buildPrestacaoPendings(
  checklist: Array<{ title: string; status: 'Enviado' | 'Parcial' | 'Pendência'; tone: 'success' | 'warning' | 'danger' }>,
  items: PrestacaoItemForm[],
) {
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

function buildPrestacaoProgressLegend(
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

function buildPrestacaoProgressDonut(items: Array<{ percent: number; tone: 'success' | 'warning' | 'danger' }>) {
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

export default App;









