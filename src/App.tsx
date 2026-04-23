import { startTransition, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { CadastroInstrumentoPage } from './components/cadastro/CadastroInstrumentoPage';
import { AjustePtStep } from './components/cadastro/steps/AjustePtStep';
import { GestaoInstrumentoStep } from './components/cadastro/steps/GestaoInstrumentoStep';
import { PrestacaoContasStep } from './components/cadastro/steps/PrestacaoContasStep';
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
  PrestacaoContasForm,
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
  DeadlineTone,
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

  function updateSelectedPrestacao<K extends keyof PrestacaoContasForm>(field: K, value: PrestacaoContasForm[K]) {
    setProcessosDb((current) => {
      const recordId = current.selectedRecordId;
      const target = current.records.find((record) => record.id === recordId);
      if (!target) return current;

      const updatedRecord: ProcessosRecord = {
        ...target,
        updatedAt: new Date().toISOString(),
        cadastro: {
          ...target.cadastro,
          prestacaoContas: {
            ...target.cadastro.prestacaoContas,
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

  function updateSelectedPrestacaoItem(itemId: string, field: keyof PrestacaoItemForm, value: string) {
    setProcessosDb((current) => {
      const recordId = current.selectedRecordId;
      const target = current.records.find((record) => record.id === recordId);
      if (!target) return current;

      const syncedItems = syncPrestacaoItemsForRecord(target);
      const nextItems = syncedItems.map((item) =>
        item.itemPlanoId === itemId
          ? {
              ...item,
              [field]: value,
            }
          : item,
      );

      const updatedRecord: ProcessosRecord = {
        ...target,
        updatedAt: new Date().toISOString(),
        cadastro: {
          ...target.cadastro,
          prestacaoContas: {
            ...target.cadastro.prestacaoContas,
            itens: nextItems,
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
    <div className="app-shell">
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
              className={item.key === activeSidebarKey ? 'side-nav__item is-active' : 'side-nav__item'}
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
              dashboardUpdatedAt,
              updateSelectedContratacaoDraft,
              replaceSelectedContratacaoDraft,
              updateSelectedContratacaoRecords,
              updateSelectedGestao,
              updateSelectedAjuste,
              updateSelectedPrestacao,
              updateSelectedPrestacaoItem,
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
  dashboardUpdatedAt: string,
  onContratacaoDraftChange: <K extends keyof ProcessoContratacaoForm>(field: K, value: ProcessoContratacaoForm[K]) => void,
  onContratacaoDraftReplace: (draft: ProcessoContratacaoForm) => void,
  onContratacaoRecordsChange: (records: ProcessoContratacaoRegistro[]) => void,
  onGestaoChange: <K extends keyof GestaoInstrumentoForm>(field: K, value: GestaoInstrumentoForm[K]) => void,
  onAjusteChange: <K extends keyof AjustePtForm>(field: K, value: AjustePtForm[K]) => void,
  onPrestacaoGlobalChange: <K extends keyof PrestacaoContasForm>(field: K, value: PrestacaoContasForm[K]) => void,
  onPrestacaoItemChange: (itemId: string, field: keyof PrestacaoItemForm, value: string) => void,
) {
  switch (view) {
    case 'dados':
      return (
        <InventoryView
          breadcrumb={breadcrumb}
          title={title}
          records={records}
          rows={data.inventoryRows}
          metrics={data.inventoryMetrics}
          selectedRecordId={selectedRecord?.id ?? ''}
          onOpenCadastroForRecord={onOpenCadastroForRecord}
          onOpenFinanceiro={onOpenFinanceiro}
          onOpenPlano={onOpenPlano}
          onOpenContratacao={onOpenContratacao}
          onViewRecord={onViewRecord}
        />
      );
    case 'plano':
      return <PlanView breadcrumb={breadcrumb} title={title} rows={data.planRows} />;
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
          metrics={data.dashboardMetrics}
          deadlines={data.dashboardDeadlines}
          recentRows={data.dashboardRecentRows}
          dashboardBars={data.dashboardBars}
          dashboardUpdatedAt={dashboardUpdatedAt}
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
          metrics={data.prestacaoMetrics}
          checklist={data.prestacaoChecklist}
          footer={data.prestacaoFooter}
          records={records}
          record={selectedRecord}
          onSelectRecord={onSelectRecord}
          onGlobalChange={onPrestacaoGlobalChange}
          onItemChange={onPrestacaoItemChange}
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
  breadcrumb,
  title,
  records,
  rows,
  metrics,
  selectedRecordId,
  onOpenCadastroForRecord,
  onOpenFinanceiro,
  onOpenPlano,
  onOpenContratacao,
  onViewRecord,
}: {
  breadcrumb: string[];
  title: { title: string; subtitle: string; action: string };
  records: ProcessosRecord[];
  rows: ViewData['inventoryRows'];
  metrics: ViewData['inventoryMetrics'];
  selectedRecordId: string;
  onOpenCadastroForRecord: (recordId: string) => void;
  onOpenFinanceiro: (recordId: string) => void;
  onOpenPlano: (recordId: string) => void;
  onOpenContratacao: (recordId: string) => void;
  onViewRecord: (recordId: string) => void;
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
  const totalValue = metrics[0]?.value ?? 'A definir';
  const activeProcesses = metrics[1]?.value ?? String(totalRows);
  const startIndex = (currentPage - 1) * pageSize;
  const pageRows = visibleRows.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const visibleCount = visibleRows.length;
  const hasFiltersActive =
    query.trim().length > 0 ||
    instrumentFilter !== 'Todos os instrumentos' ||
    statusFilter !== 'Todos os status' ||
    sectorFilter !== 'Todas as unidades';

  return (
    <section className="view inventory-page">
      <header className="inventory-head">
        <div className="inventory-head__copy">
          <span className="inventory-head__eyebrow">Registros consolidados</span>
          <div className="crumbs">
            {breadcrumb.map((item, index) => (
              <span key={item} className={index === breadcrumb.length - 1 ? 'crumb is-current' : 'crumb'}>
                {item}
              </span>
            ))}
          </div>
          <h3>{title.title}</h3>
          <p>{title.subtitle}</p>
        </div>

        <div className="inventory-head__stats" aria-label="Resumo consolidado">
          <div className="inventory-stat inventory-stat--primary">
            <div className="inventory-stat__icon">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
            <span>Total sob gestão</span>
            <strong>{totalValue}</strong>
          </div>
          <div className="inventory-stat inventory-stat--secondary">
            <div className="inventory-stat__icon">
              <span className="material-symbols-outlined">stacked_bar_chart</span>
            </div>
            <span>Processos ativos</span>
            <strong>{activeProcesses}</strong>
          </div>
        </div>
      </header>

      <section className="inventory-filters">
        <label className="inventory-filter">
          <span>Busca rápida</span>
          <input
            className="form-input"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Número, instrumento, setor ou objeto"
          />
        </label>
        <label className="inventory-filter">
          <span>Instrumento</span>
          <select className="form-input form-input--select" value={instrumentFilter} onChange={(event) => setInstrumentFilter(event.target.value)}>
            {instrumentOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="inventory-filter">
          <span>Status Operacional</span>
          <select className="form-input form-input--select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="inventory-filter">
          <span>Unidade</span>
          <select className="form-input form-input--select" value={sectorFilter} onChange={(event) => setSectorFilter(event.target.value)}>
            {sectorOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="inventory-filters__action"
          onClick={() => {
          setQuery('');
          setInstrumentFilter('Todos os instrumentos');
          setStatusFilter('Todos os status');
          setSectorFilter('Todas as unidades');
        }}
      >
          <span className="material-symbols-outlined">{hasFiltersActive ? 'filter_alt_off' : 'filter_list'}</span>
          {hasFiltersActive ? 'Limpar filtros' : 'Filtros ativos'}
        </button>
      </section>

      <section className="inventory-summary-strip" aria-label="Resumo da lista">
        <div className="inventory-summary-card">
          <span>Total na página</span>
          <strong>{pageRows.length}</strong>
        </div>
        <div className="inventory-summary-card">
          <span>Registros cadastrados</span>
          <strong>{visibleCount} filtrados / {totalRows}</strong>
        </div>
        <div className="inventory-summary-card">
          <span>Instrumento selecionado</span>
          <strong>{selectedRecordId ? 'Ativo' : 'Nenhum'}</strong>
        </div>
      </section>

      <section className="inventory-table-card">
        <div className="table-wrap">
          <table className="data-table inventory-table">
            <thead>
              <tr>
                <th>ID REF</th>
                <th>INSTRUMENTO</th>
                <th>STATUS</th>
                <th>VIGÊNCIA</th>
                <th>VALOR GLOBAL</th>
                <th>EXECUÇÃO</th>
                <th>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length ? (
                pageRows.map((row) => (
                  <tr key={row.id} className={row.id === selectedRecordId ? 'is-selected' : ''}>
                    <td className="td-ref">{row.ref}</td>
                    <td>
                      <div className="item-title">{row.title}</div>
                      <div className="item-subtitle">{row.subtitle}</div>
                    </td>
                    <td>
                      <span className={`badge badge--${row.statusTone}`}>{row.status}</span>
                    </td>
                    <td className="td-strong">{row.due}</td>
                    <td className="td-strong">{row.amount}</td>
                    <td>
                      <div className="progress-cell progress-cell--compact">
                        <div className="progress-track progress-track--large">
                          <span className="progress-bar" style={{ width: `${row.progress}%` }} />
                        </div>
                        <strong>{row.progress}%</strong>
                      </div>
                    </td>
                    <td>
                      <div className="inventory-actions">
                        <button
                          type="button"
                          className="icon-action"
                          onClick={() => onOpenCadastroForRecord(row.id)}
                          aria-label="Editar processo"
                          title="Editar cadastro do processo"
                          data-tooltip="Editar cadastro do processo"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          type="button"
                          className="icon-action"
                          onClick={() => onOpenFinanceiro(row.id)}
                          aria-label="Abrir financeiro"
                          title="Abrir módulo de prestação de contas"
                          data-tooltip="Abrir módulo de prestação de contas"
                        >
                          <span className="material-symbols-outlined">account_balance_wallet</span>
                        </button>
                        <button
                          type="button"
                          className="icon-action"
                          onClick={() => onOpenPlano(row.id)}
                          aria-label="Editar plano de trabalho"
                          title="Abrir Plano de Ação"
                          data-tooltip="Abrir Plano de Ação"
                        >
                          <span className="material-symbols-outlined">edit_document</span>
                        </button>
                        <button
                          type="button"
                          className="icon-action"
                          onClick={() => onOpenContratacao(row.id)}
                          aria-label="Abrir contratações"
                          title="Abrir módulo de contratações"
                          data-tooltip="Abrir módulo de contratações"
                        >
                          <span className="material-symbols-outlined">contract</span>
                        </button>
                        <button
                          type="button"
                          className="icon-action"
                          onClick={() => onViewRecord(row.id)}
                          aria-label="Visualizar dados do instrumento"
                          title="Visualizar dados completos do processo"
                          data-tooltip="Visualizar dados completos do processo"
                        >
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
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
      </section>

      <footer className="inventory-footer">
        <span className="inventory-footer__count">
          {pageRows.length
            ? totalPages === 1
              ? `Mostrando ${pageRows.length}`
              : `Mostrando página ${currentPage} de ${totalPages}`
            : 'Nenhum resultado'}
        </span>
        <div className="inventory-pagination" aria-label="Paginação">
          {totalPages > 1 ? (
            <>
              <button
                type="button"
                className="inventory-pagination__arrow"
                aria-label="Página anterior"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={page === currentPage ? 'inventory-pagination__page is-active' : 'inventory-pagination__page'}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                className="inventory-pagination__arrow"
                aria-label="Próxima página"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </>
          ) : (
            <button type="button" className="inventory-pagination__page is-active" aria-current="page">
              1
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}

function PlanView({
  breadcrumb,
  title,
  rows,
}: {
  breadcrumb: string[];
  title: { title: string; subtitle: string; action: string };
  rows: ViewData['planRows'];
}) {
  return (
    <section className="view">
      <SectionHeader breadcrumb={breadcrumb} title={title.title} subtitle={title.subtitle} action={title.action} />
      <section className="table-card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>CATEGORIA/OBJETO</th>
                <th>ITEM</th>
                <th>QUANT.</th>
                <th>UNID.</th>
                <th>V. UNITARIO</th>
                <th>V. TOTAL</th>
                <th>AJUSTE?</th>
                <th>DOCUMENTO</th>
                <th>MONITORADO</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.document}>
                  <td>{row.category}</td>
                  <td>{row.item}</td>
                  <td>{row.quantity}</td>
                  <td>{row.unit}</td>
                  <td>{row.unitValue}</td>
                  <td>{row.totalValue}</td>
                  <td>{row.tag}</td>
                  <td>{row.document}</td>
                  <td>{String(row.monitored)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
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
          <p>Selecione um processo na lista para cadastrar contratações vinculadas ao Plano de Ação.</p>
        </section>
      )}
    </section>
  );
}

function ManagementView({
  breadcrumb,
  title,
  metrics,
  deadlines,
  recentRows,
  dashboardBars,
  dashboardUpdatedAt,
  record,
  onGestaoChange,
}: {
  breadcrumb: string[];
  title: { title: string; subtitle: string; action: string };
  metrics: ViewData['dashboardMetrics'];
  deadlines: ViewData['dashboardDeadlines'];
  recentRows: ViewData['dashboardRecentRows'];
  dashboardBars: ViewData['dashboardBars'];
  dashboardUpdatedAt: string;
  record: ProcessosRecord | null;
  onGestaoChange: <K extends keyof GestaoInstrumentoForm>(field: K, value: GestaoInstrumentoForm[K]) => void;
}) {
  const criticalDeadlines = deadlines.filter((deadline) => deadline.tone === 'critical').length;
  const warningDeadlines = deadlines.filter((deadline) => deadline.tone === 'warning').length;

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
      <header className="dashboard-head">
        <div className="crumbs">
          {breadcrumb.map((item, index) => (
            <span key={item} className={index === breadcrumb.length - 1 ? 'crumb is-current' : 'crumb'}>
              {item}
            </span>
          ))}
        </div>
        <div className="dashboard-head__row">
          <div className="dashboard-head__copy">
            <h2>{title.title}</h2>
            <p>{title.subtitle}</p>
          </div>
          <div className="dashboard-head__meta">
            <span className="dashboard-head__chip">Banco fictício local</span>
            <span className="dashboard-hero__meta">
              <span className="material-symbols-outlined">calendar_today</span>
              <span>Atualizado em {dashboardUpdatedAt}</span>
            </span>
          </div>
        </div>
      </header>

      <section className="dashboard-metrics dashboard-metrics--compact">
        {metrics.map((metric) => (
          <article key={metric.label} className={`dashboard-metric dashboard-metric--${metric.tone}`}>
            <p>{metric.label}</p>
            <div className="dashboard-metric__value-row">
              <strong title={metric.value}>{formatDashboardMetricValue(metric.value)}</strong>
              <span className="material-symbols-outlined" data-tone={metric.tone}>
                {metric.icon}
              </span>
            </div>
            <small>{metric.hint}</small>
          </article>
        ))}
      </section>

      <section className="dashboard-main dashboard-main--overview">
        <div className="dashboard-left-stack">
          <article className="dashboard-panel dashboard-panel--chart">
            <div className="dashboard-panel__head">
              <div>
                <h3>Execução financeira anual</h3>
                <p>Comparativo entre previsto e executado com base na carteira atual.</p>
              </div>
              <div className="dashboard-legend">
                <span>
                  <i className="dashboard-legend__swatch dashboard-legend__swatch--expected" />
                  Previsto
                </span>
                <span>
                  <i className="dashboard-legend__swatch dashboard-legend__swatch--executed" />
                  Executado
                </span>
              </div>
            </div>
            <div className="dashboard-chart-shell">
              <svg className="dashboard-chart-svg" viewBox="0 0 640 240" role="img" aria-label="Gráfico de execução financeira anual">
                <defs>
                  <linearGradient id="dashboardExpectedGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#cfd8e5" />
                    <stop offset="100%" stopColor="#afbdd3" />
                  </linearGradient>
                  <linearGradient id="dashboardExecutedGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#1f3f73" />
                    <stop offset="100%" stopColor="#0b2342" />
                  </linearGradient>
                </defs>

                {[35, 70, 105, 140].map((y) => (
                  <g key={y}>
                    <line x1="24" x2="612" y1={y} y2={y} className="dashboard-chart-grid" />
                  </g>
                ))}

                {dashboardBars.map((bar, index) => {
                  const groupWidth = 142;
                  const groupGap = 18;
                  const startX = 36 + index * (groupWidth + groupGap);
                  const chartTop = 54;
                  const chartBottom = 186;
                  const chartHeight = chartBottom - chartTop;
                  const expectedHeight = Math.max(10, (bar.expected / 100) * chartHeight);
                  const executedHeight = Math.max(10, (bar.executed / 100) * chartHeight);
                  const expectedX = startX + 16;
                  const executedX = startX + 50;
                  const expectedY = chartBottom - expectedHeight;
                  const executedY = chartBottom - executedHeight;
                  const expectedAtTop = expectedY <= chartTop + 14;
                  const executedAtTop = executedY <= chartTop + 14;
                  const topLabelBand = chartTop - 14;
                  const topLabelBandSecond = chartTop - 2;
                  const expectedLabelY = expectedAtTop ? topLabelBand : expectedY - 8;
                  const executedLabelY = executedAtTop ? topLabelBandSecond : executedY - 8;
                  const expectedLabelClass = expectedAtTop
                    ? 'dashboard-chart-value dashboard-chart-value--executed dashboard-chart-value--inside'
                    : 'dashboard-chart-value';
                  const executedLabelClass = executedAtTop
                    ? 'dashboard-chart-value dashboard-chart-value--executed dashboard-chart-value--inside'
                    : 'dashboard-chart-value dashboard-chart-value--executed';
                  const expectedLabelX = expectedX + 12;
                  const executedLabelX = executedX + 12;
                  const expectedAnchor = 'middle';
                  const executedAnchor = 'middle';

                  return (
                    <g key={bar.label}>
                      <rect
                        x={expectedX}
                        y={expectedY}
                        width="24"
                        height={expectedHeight}
                        rx="6"
                        fill="url(#dashboardExpectedGradient)"
                      />
                      <rect
                        x={executedX}
                        y={executedY}
                        width="24"
                        height={executedHeight}
                        rx="6"
                        fill="url(#dashboardExecutedGradient)"
                      />
                      <text x={expectedLabelX} y={expectedLabelY} textAnchor={expectedAnchor} className={expectedLabelClass}>
                        {bar.expected}%
                      </text>
                      <text x={executedLabelX} y={executedLabelY} textAnchor={executedAnchor} className={executedLabelClass}>
                        {bar.executed}%
                      </text>
                      <text x={startX + 36} y="216" textAnchor="middle" className="dashboard-chart-label">
                        {bar.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </article>

          <article className="dashboard-table-card dashboard-table-card--recent">
            <div className="dashboard-table-card__head">
              <div>
                <h3>Processos recentes</h3>
                <p>Últimos instrumentos atualizados na base consolidada.</p>
              </div>
              <button type="button" className="dashboard-link-button">
                Ver Processos
              </button>
            </div>
            <div className="table-wrap">
              <table className="data-table dashboard-table">
                <thead>
                  <tr>
                    <th>ID Processo</th>
                    <th>Objeto / Instrumento</th>
                    <th>Setor Responsável</th>
                    <th>Prazo Final</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className="item-title">{renderRecentProcessId(row.id)}</div>
                        <div className="item-subtitle">{row.vigency}</div>
                      </td>
                      <td>
                        <div className="item-title">{row.title}</div>
                        <div className="item-subtitle">{row.subtitle}</div>
                      </td>
                      <td className="td-muted">{row.sector}</td>
                      <td>{row.vigency}</td>
                      <td>
                        <span className={`badge dashboard-status-badge badge--${row.statusTone}`} title={row.status}>
                          {row.status}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="dashboard-row-action" aria-label={`Abrir ${row.id}`}>
                          <span className="material-symbols-outlined">open_in_new</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <aside className="dashboard-side-stack">
          <article className="dashboard-alert-panel dashboard-alert-panel--tight">
            <div className="dashboard-deadline-panel__head">
              <div>
                <div className="section-kicker section-kicker--detail">Prioridade operacional</div>
                <h3>Vigência próxima</h3>
                <p>Processos que exigem acompanhamento imediato para evitar perda de prazo.</p>
              </div>
              <div className="dashboard-deadline-panel__summaryline" aria-label="Resumo das vigências">
                <span className="dashboard-deadline-panel__stat dashboard-deadline-panel__stat--critical">
                  <strong>{criticalDeadlines}</strong>
                  <small>Críticos</small>
                </span>
                <span className="dashboard-deadline-panel__stat dashboard-deadline-panel__stat--warning">
                  <strong>{warningDeadlines}</strong>
                  <small>Próximos</small>
                </span>
              </div>
            </div>
            <div className="dashboard-alert-list">
              {deadlines.map((row) => (
                <div key={row.id} className={`dashboard-deadline-item dashboard-deadline-item--${row.tone}`}>
                  <div className="dashboard-deadline-item__marker" aria-hidden="true" />
                  <div className="dashboard-deadline-item__main">
                    <strong>{row.id}</strong>
                    <span>{row.object}</span>
                  </div>
                  <div className="dashboard-deadline-item__meta">
                    <span className={`dashboard-deadline-chip dashboard-deadline-chip--${deadlineBadgeTone(row.tone)}`} title={row.deadline}>
                      <span className="dashboard-deadline-chip__label">{row.deadlineLabel}</span>
                      <span className="dashboard-deadline-chip__count">
                        {row.deadlineDays === null ? 'Prazo indefinido' : `${Math.abs(row.deadlineDays)} dias`}
                      </span>
                    </span>
                    <small>{row.vigency}</small>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="dashboard-link-button dashboard-link-button--center dashboard-alerts__button">
              <span className="material-symbols-outlined" aria-hidden="true">
                schedule
              </span>
              <span>Ver vigências</span>
              <span className="dashboard-alerts__button-arrow material-symbols-outlined" aria-hidden="true">
                arrow_forward
              </span>
            </button>
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

function deadlineBadgeTone(tone: DeadlineTone) {
  if (tone === 'critical') return 'danger';
  return tone;
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
              <h3>Ajuste do Plano de Ação</h3>
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
  metrics,
  checklist,
  footer,
  records,
  record,
  onSelectRecord,
  onGlobalChange,
  onItemChange,
}: {
  breadcrumb: string[]; 
  title: { title: string; subtitle: string; action: string };
  metrics: ViewData['prestacaoMetrics'];
  checklist: ViewData['prestacaoChecklist'];
  footer: ViewData['prestacaoFooter'];
  records: ProcessosRecord[];
  record: ProcessosRecord | null;
  onSelectRecord: (recordId: string) => void;
  onGlobalChange: <K extends keyof PrestacaoContasForm>(field: K, value: PrestacaoContasForm[K]) => void;
  onItemChange: (itemId: string, field: keyof PrestacaoItemForm, value: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const prestacaoItems = useMemo(() => syncPrestacaoItemsForRecord(record), [record]);
  const contractNumber =
    record?.cadastro.processoContratacao.contratoNumero || record?.cadastro.processoContratacao.processoSei || 'A definir';
  const processNumber = record?.cadastro.dadosGerais.numeroInternoSeap || record?.cadastro.dadosGerais.instrumento || 'A definir';
  const contractValue = record?.cadastro.processoContratacao.valorTotalContratado || record?.cadastro.dadosGerais.valorGlobal || 'A definir';
  const totalItemCount = prestacaoItems.length;
  const completedChecklistCount = checklist.filter((entry) => entry.tone === 'success').length;
  const checklistProgress = checklist.length ? Math.round((completedChecklistCount / checklist.length) * 100) : 0;
  const selectedRecordId = record?.id ?? '';
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredRecords = useMemo(() => {
    const matchesRecord = (candidate: ProcessosRecord) => {
      if (!normalizedSearch) return true;

      const haystack = [
        candidate.id,
        candidate.cadastro.dadosGerais.numeroInternoSeap,
        candidate.cadastro.dadosGerais.numeroInstrumento,
        candidate.cadastro.dadosGerais.instrumento,
        candidate.cadastro.dadosGerais.eixo,
        candidate.cadastro.dadosGerais.setorCorrelacionado,
        candidate.cadastro.dadosGerais.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    };

    return [...records]
      .filter(matchesRecord)
      .sort((left, right) => {
        if (left.id === selectedRecordId) return -1;
        if (right.id === selectedRecordId) return 1;
        return recordTitle(left).localeCompare(recordTitle(right), 'pt-BR');
      });
  }, [normalizedSearch, records, selectedRecordId]);
  const flowSteps = [
    {
      href: '#prestacao-instrumento',
      index: '01',
      label: 'Instrumento',
      detail: record ? processNumber : 'Obrigatório',
    },
    {
      href: '#prestacao-itens',
      index: '02',
      label: 'Itens',
      detail: `${totalItemCount} ${totalItemCount === 1 ? 'item' : 'itens'}`,
    },
    {
      href: '#prestacao-resumo',
      index: '03',
      label: 'Resumo',
      detail: `${checklistProgress}% documental`,
    },
    {
      href: '#prestacao-global',
      index: '04',
      label: 'Base da prestação',
      detail: record ? footer.status : 'Aguardando',
    },
  ];

  return (
    <section className="view prestacao-view">
      <SectionHeader breadcrumb={breadcrumb} title={title.title} subtitle={title.subtitle} action={title.action} />

      <nav className="prestacao-flow-nav" aria-label="Fluxo da prestação de contas">
        {flowSteps.map((step) => (
          <a
            key={step.href}
            className={record || step.href === '#prestacao-instrumento' ? 'prestacao-flow-nav__item' : 'prestacao-flow-nav__item is-disabled'}
            href={record || step.href === '#prestacao-instrumento' ? step.href : '#prestacao-instrumento'}
            aria-disabled={record || step.href === '#prestacao-instrumento' ? undefined : true}
          >
            <span className="prestacao-flow-nav__index">{step.index}</span>
            <span className="prestacao-flow-nav__text">
              <strong>{step.label}</strong>
              <small>{step.detail}</small>
            </span>
          </a>
        ))}
      </nav>

            <article id="prestacao-instrumento" className="prestacao-process-rail prestacao-anchor">
        <div className="prestacao-process-rail__head">
          <div className="prestacao-process-rail__copy">
            <div className="section-kicker">Processos vinculados</div>
            <h3>Selecione o processo principal e abra a prestação do item em seguida.</h3>
            <p>Os processos aparecem em uma faixa horizontal para acelerar a leitura. Ao abrir um processo, os itens vinculados continuam abaixo na mesma tela.</p>
          </div>
          <label className="prestacao-search prestacao-process-rail__search" htmlFor="prestacao-search-input">
            <span className="material-symbols-outlined" aria-hidden="true">
              search
            </span>
            <input
              id="prestacao-search-input"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Pesquisar por número, eixo, setor ou status"
            />
          </label>
        </div>

        <div className="prestacao-process-rail__list" aria-label="Lista horizontal de processos disponíveis">
          {filteredRecords.length ? (
            filteredRecords.map((candidate) => {
              const isActive = candidate.id === selectedRecordId;
              const summary = buildProcessoConsolidatedSummary(candidate);
              const itemCount = candidate.cadastro.planoTrabalho.itens.length;
              return (
                <article key={candidate.id} className={isActive ? 'prestacao-process-card is-active' : 'prestacao-process-card'}>
                  <div className="prestacao-process-card__head">
                    <div className="prestacao-process-card__title">
                      <strong>{recordTitle(candidate)}</strong>
                      <span>
                        {candidate.cadastro.dadosGerais.instrumento || 'Instrumento sem nome'} · {candidate.cadastro.dadosGerais.eixo || 'Eixo não informado'}
                      </span>
                    </div>
                    <span className={`badge badge--${summary.percentualExecutado > 0 ? 'info' : 'neutral'}`}>
                      {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                  <div className="prestacao-process-card__meta">
                    <span>Setor: {candidate.cadastro.dadosGerais.setorCorrelacionado || 'Não informado'}</span>
                    <span>Status: {candidate.cadastro.dadosGerais.status || 'A definir'}</span>
                    <span>Saldo: {summary.saldoDisponivel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    <span>Executado: {summary.valorTotalPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  <div className="prestacao-process-card__foot">
                    <button
                      type="button"
                      className={isActive ? 'prestacao-process-card__action is-active' : 'prestacao-process-card__action'}
                      onClick={() => {
                        onSelectRecord(candidate.id);
                        window.requestAnimationFrame(() => {
                          document.getElementById('prestacao-itens')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        });
                      }}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">open_in_new</span>
                      {isActive ? 'Processo aberto' : 'Abrir prestação'}
                    </button>
                    <small>{candidate.cadastro.dadosGerais.numeroInternoSeap || candidate.cadastro.dadosGerais.numeroInstrumento || 'Sem referência'}</small>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="prestacao-process-rail__empty">
              <strong>Nenhum instrumento encontrado</strong>
              <p>Tente pesquisar por número interno, eixo, setor ou status.</p>
            </div>
          )}
        </div>

        <div className="prestacao-process-rail__selected">
          <span>Selecionado para prestação</span>
          <strong>{selectedRecordId ? processNumber : 'Nenhum instrumento selecionado'}</strong>
          <small>{selectedRecordId ? `Contrato / processo: ${contractNumber}` : 'Escolha um processo acima para carregar os itens vinculados.'}</small>
          <small>{selectedRecordId ? `Valor contratado: ${contractValue}` : 'Cada item do processo selecionado será aberto abaixo para prestação.'}</small>
        </div>
      </article><div id="prestacao-resumo" className="prestacao-section-head prestacao-anchor">
        <div>
          <div className="section-kicker">Resumo operacional</div>
          <h3>Leitura rápida do instrumento antes do lançamento</h3>
        </div>
        <p>Este bloco substitui a lógica de painel genérico por uma visão própria da prestação: instrumento, itens, execução e pendências.</p>
      </div>

      <section className="prestacao-summary-grid prestacao-metrics-strip" aria-label="Resumo da prestação">
        {metrics.map((metric) => (
          <article key={metric.label} className={`prestacao-summary-card prestacao-summary-card--${metric.tone}`}>
            <span className="prestacao-summary-card__icon material-symbols-outlined" aria-hidden="true">
              {metric.icon}
            </span>
            <span>{metric.label}</span>
            <strong title={metric.value}>{formatDashboardMetricValue(metric.value)}</strong>
            <small>{metric.hint}</small>
          </article>
        ))}
      </section>

      {record ? (
        <PrestacaoContasStep
          data={record.cadastro.prestacaoContas}
          items={prestacaoItems}
          totalGlobal={record.cadastro.dadosGerais.valorGlobal || 'A definir'}
          footer={footer}
          onGlobalChange={onGlobalChange}
          onItemChange={onItemChange}
        />
      ) : (
        <article className="empty-module-state">
          <strong>Nenhum processo selecionado</strong>
          <p>Selecione um instrumento em Processos para lançar débitos e fechar a prestação por item.</p>
        </article>
      )}
    </section>
  );
}

export default App;









