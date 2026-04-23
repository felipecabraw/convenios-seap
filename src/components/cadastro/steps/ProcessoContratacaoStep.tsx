import { CSSProperties, useEffect, useMemo, useState } from 'react';
import {
  cadastroOptionSets,
  ContratacaoItemVinculado,
  PlanoItemForm,
  ProcessoContratacaoForm,
  ProcessoContratacaoRegistro,
  SelectOption,
  calculateProcessoContratacaoTotal,
  sumProcessoContratacaoTotalPago,
} from '../../../data/cadastro';
import { CalculatedField, CurrencyField, DateField, FormSection, SelectField, TextField } from '../fields';

type ProcessFieldSpan = 'full' | 'half' | 'third' | 'quarter';
type ProcessFieldKind = 'text' | 'date' | 'currency' | 'select' | 'calculated';

type ProcessFieldConfig = {
  key: keyof ProcessoContratacaoForm;
  label: string;
  kind: ProcessFieldKind;
  span?: ProcessFieldSpan;
  hint?: string;
  required?: boolean;
  options?: readonly SelectOption[];
};

type ProcessFieldGroup = {
  title: string;
  description: string;
  accent: string;
  fields: ProcessFieldConfig[];
};

const statusProcessoOptions: readonly SelectOption[] = [
  { value: 'Em instrução', label: 'Em instrução' },
  { value: 'Em contratação', label: 'Em contratação' },
  { value: 'Contratado', label: 'Contratado' },
  { value: 'Em execução', label: 'Em execução' },
  { value: 'Pago', label: 'Pago' },
  { value: 'Finalizado', label: 'Finalizado' },
];

const transferegovOptions = cadastroOptionSets.simNao;

const contractingGroups: ProcessFieldGroup[] = [
  {
    title: 'Identificação do processo',
    description: 'A base relacional do registro começa aqui: SEI, status e vínculo com a plataforma de transferência.',
    accent: '#1c4071',
    fields: [
      { key: 'processoSei', label: 'Processo SEI nº', kind: 'text', required: true },
      { key: 'statusProcesso', label: 'Status de processo', kind: 'select', options: statusProcessoOptions, required: true },
      { key: 'transferegovProcesso', label: 'Aba transferegov.br?', kind: 'select', options: transferegovOptions, required: true },
    ],
  },
  {
    title: 'Empenho (NE)',
    description: 'Empenho e rastreabilidade documental do compromisso orçamentário.',
    accent: '#8b5a2b',
    fields: [
      { key: 'neNumero', label: 'NE nº', kind: 'text' },
      { key: 'neData', label: 'NE Data', kind: 'date' },
      { key: 'neValor', label: 'NE Valor', kind: 'currency' },
      { key: 'neFonte', label: 'NE Fonte', kind: 'text' },
      { key: 'neSei', label: 'NE SEI nº', kind: 'text' },
    ],
  },
  {
    title: 'Contrato',
    description: 'Instrumento contratual e sua confirmação dentro do fluxo institucional.',
    accent: '#1f7a49',
    fields: [
      { key: 'contratoNumero', label: 'Contrato nº', kind: 'text', required: true },
      { key: 'contratoSei', label: 'Contrato SEI nº', kind: 'text' },
      { key: 'transferegovContrato', label: 'Aba transferegov.br?', kind: 'select', options: transferegovOptions },
    ],
  },
  {
    title: 'Dados da contratação',
    description: 'Valor unitário, quantidade e total calculado automaticamente a partir da base informada.',
    accent: '#4d5f86',
    fields: [
      { key: 'valorUnitarioContratado', label: 'Valor Unitário Contratado', kind: 'currency', required: true },
      { key: 'quantidadeContratada', label: 'Quantidade Contratada', kind: 'text', required: true },
      {
        key: 'valorTotalContratado',
        label: 'Valor Total Contratado',
        kind: 'calculated',
        hint: 'Calculado automaticamente com base em quantidade x valor unitário.',
      },
    ],
  },
  {
    title: 'Contratado',
    description: 'Registro da entidade contratada e sua identificação fiscal.',
    accent: '#7c3b5b',
    fields: [
      { key: 'enteContratado', label: 'Ente Contratado', kind: 'text', required: true, span: 'full' },
      { key: 'cnpjContratado', label: 'CNPJ do Contratado', kind: 'text' },
    ],
  },
  {
    title: 'Responsáveis',
    description: 'Gestão e fiscalização vinculadas ao processo de contratação.',
    accent: '#466f63',
    fields: [
      { key: 'gestor', label: 'Gestor', kind: 'text' },
      { key: 'portariaGestorSei', label: 'Portaria SEI nº (Gestor)', kind: 'text' },
      { key: 'fiscal', label: 'Fiscal', kind: 'text' },
      { key: 'portariaFiscalSei', label: 'Portaria SEI nº (Fiscal)', kind: 'text' },
    ],
  },
  {
    title: 'Nota fiscal',
    description: 'Vínculo do documento fiscal com o contrato e com o fluxo de recebimento.',
    accent: '#c08a3f',
    fields: [
      { key: 'notaFiscalNumero', label: 'Nota Fiscal nº', kind: 'text' },
      { key: 'notaFiscalSei', label: 'Nota Fiscal SEI nº', kind: 'text' },
    ],
  },
  {
    title: 'Execução e recebimento',
    description: 'Caminho documental entre a fiscalização e os termos de recebimento.',
    accent: '#2c6c91',
    fields: [
      { key: 'informacaoGestorSei', label: 'Informação do Gestor SEI nº', kind: 'text', span: 'full' },
      { key: 'termoRecebimentoProvisorioSei', label: 'Termo de Recebimento Provisório SEI nº', kind: 'text', span: 'full' },
      { key: 'termoRecebimentoDefinitivoSei', label: 'Termo de Recebimento Definitivo SEI nº', kind: 'text', span: 'full' },
    ],
  },
  {
    title: 'Pagamento (OB)',
    description: 'Liquidação financeira e vínculo bancário da ordem de pagamento.',
    accent: '#5b6780',
    fields: [
      { key: 'obNumero', label: 'OB nº', kind: 'text' },
      { key: 'obData', label: 'OB Data', kind: 'date' },
      { key: 'obValor', label: 'OB Valor', kind: 'currency' },
      { key: 'obFonte', label: 'OB Fonte', kind: 'text' },
      { key: 'obSei', label: 'OB SEI nº', kind: 'text' },
    ],
  },
  {
    title: 'Patrimônio',
    description: 'Tombamento e rastreio patrimonial do bem ou serviço entregue.',
    accent: '#8a6b2e',
    fields: [
      { key: 'tomboNumero', label: 'Tombo nº', kind: 'text' },
      { key: 'guiaTombamentoSei', label: 'Guia de Tombamento SEI nº', kind: 'text' },
      { key: 'fotoSei', label: 'Foto no SEI nº', kind: 'text' },
    ],
  },
  {
    title: 'Entrega',
    description: 'Encerramento da entrega com referência documental e unidade beneficiada.',
    accent: '#1d5b78',
    fields: [
      { key: 'transferegovEntrega', label: 'Aba transferegov.br?', kind: 'select', options: transferegovOptions },
      { key: 'termoEntregaSei', label: 'Termo de Entrega SEI nº', kind: 'text' },
      { key: 'relatorioBeneficiados', label: 'Relatório de beneficiados', kind: 'text', span: 'full' },
      { key: 'localizacao', label: 'Localização', kind: 'text' },
      { key: 'unidadeBeneficiada', label: 'Unidade Beneficiada', kind: 'text' },
    ],
  },
];

function parseCurrency(value: string) {
  if (!value) return 0;
  const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatLinkedItemTotal(item: ContratacaoItemVinculado) {
  const total = calculateProcessoContratacaoTotal(item.quantidadeContratada, item.valorUnitarioContratado);
  return total || item.valorTotalContratado;
}

function formatCurrencyField(value: string) {
  const parsed = parseCurrency(value);
  return parsed > 0 ? formatCurrency(parsed) : '—';
}

function formatTextField(value: string) {
  return value.trim() ? value : '—';
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createRecordId() {
  return globalThis.crypto?.randomUUID?.() ?? `contratacao-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildRecordFromDraft(
  draft: ProcessoContratacaoForm,
  id: string,
  linkedItems: ContratacaoItemVinculado[],
): ProcessoContratacaoRegistro {
  const normalizedLinkedItems = linkedItems.map((item) => ({
    ...item,
    valorTotalContratado: formatLinkedItemTotal(item),
  }));
  const linkedTotal = normalizedLinkedItems.reduce((sum, item) => sum + parseCurrency(item.valorTotalContratado), 0);
  const valorTotalCalculado = linkedTotal > 0
    ? formatCurrency(linkedTotal)
    : calculateProcessoContratacaoTotal(draft.quantidadeContratada, draft.valorUnitarioContratado);

  return {
    ...draft,
    id,
    valorTotalContratado: valorTotalCalculado || draft.valorTotalContratado,
    itensVinculados: normalizedLinkedItems,
  };
}

function getDraftIssues(draft: ProcessoContratacaoForm, linkedItems: ContratacaoItemVinculado[], hasPlanoItems: boolean) {
  const requiredFields: Array<[keyof ProcessoContratacaoForm, string]> = [
    ['processoSei', 'Processo SEI nº'],
    ['statusProcesso', 'Status de processo'],
    ['transferegovProcesso', 'Aba transferegov.br? do processo'],
    ['contratoNumero', 'Contrato nº'],
    ['valorUnitarioContratado', 'Valor Unitário Contratado'],
    ['quantidadeContratada', 'Quantidade Contratada'],
    ['enteContratado', 'Ente Contratado'],
  ];

  const issues = requiredFields.filter(([key]) => !(draft[key] ?? '').trim()).map(([, label]) => label);
  if (hasPlanoItems && !linkedItems.length) issues.push('Vincular pelo menos um item do Plano de Ação');
  return issues;
}

function createLinkedItemFromPlanoItem(item: PlanoItemForm): ContratacaoItemVinculado {
  return {
    id: `link-${item.id}-${Date.now()}`,
    planoItemId: item.id,
    itemDescricao: item.item,
    quantidadeContratada: item.quantidade || '1',
    valorUnitarioContratado: item.valorUnitarioAutorizado,
    valorTotalContratado: item.valorTotalAutorizado,
  };
}

function renderField(
  field: ProcessFieldConfig,
  draft: ProcessoContratacaoForm,
  onDraftChange: <K extends keyof ProcessoContratacaoForm>(key: K, value: ProcessoContratacaoForm[K]) => void,
  calculatedTotal: string,
) {
  const value = (draft[field.key] ?? '') as string;

  switch (field.kind) {
    case 'select':
      return (
        <SelectField
          key={field.key}
          label={field.label}
          value={value}
          options={field.options ?? []}
          hint={field.hint}
          span={field.span}
          required={field.required}
          onChange={(nextValue) => onDraftChange(field.key, nextValue)}
        />
      );
    case 'date':
      return (
        <DateField
          key={field.key}
          label={field.label}
          value={value}
          hint={field.hint}
          span={field.span}
          required={field.required}
          onChange={(nextValue) => onDraftChange(field.key, nextValue)}
        />
      );
    case 'currency':
      return (
        <CurrencyField
          key={field.key}
          label={field.label}
          value={value}
          hint={field.hint}
          span={field.span}
          required={field.required}
          onChange={(nextValue) => onDraftChange(field.key, nextValue)}
        />
      );
    case 'calculated':
      return <CalculatedField key={field.key} label={field.label} value={calculatedTotal} hint={field.hint} span={field.span} />;
    default:
      return (
        <TextField
          key={field.key}
          label={field.label}
          value={value}
          hint={field.hint}
          span={field.span}
          required={field.required}
          onChange={(nextValue) => onDraftChange(field.key, nextValue)}
        />
      );
  }
}

export function ProcessoContratacaoStep({
  draft,
  records,
  planoItems = [],
  onDraftChange,
  onDraftReplace,
  onRecordsChange,
  onClearDraft,
}: {
  draft: ProcessoContratacaoForm;
  records: ProcessoContratacaoRegistro[];
  planoItems?: PlanoItemForm[];
  onDraftChange: <K extends keyof ProcessoContratacaoForm>(field: K, value: ProcessoContratacaoForm[K]) => void;
  onDraftReplace: (draft: ProcessoContratacaoForm) => void;
  onRecordsChange: (records: ProcessoContratacaoRegistro[]) => void;
  onClearDraft: () => void;
}) {
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [linkedItems, setLinkedItems] = useState<ContratacaoItemVinculado[]>([]);

  const linkedTotal = useMemo(
    () => linkedItems.reduce((sum, item) => sum + parseCurrency(formatLinkedItemTotal(item)), 0),
    [linkedItems],
  );

  const calculatedTotal = useMemo(() => {
    if (linkedTotal > 0) return formatCurrency(linkedTotal);
    return calculateProcessoContratacaoTotal(draft.quantidadeContratada, draft.valorUnitarioContratado);
  }, [draft.quantidadeContratada, draft.valorUnitarioContratado, linkedTotal]);

  const totalContratado = useMemo(() => records.reduce((sum, record) => {
    const recordLinkedTotal = (record.itensVinculados ?? []).reduce((itemSum, item) => itemSum + parseCurrency(item.valorTotalContratado), 0);
    return sum + (recordLinkedTotal > 0 ? recordLinkedTotal : parseCurrency(record.valorTotalContratado));
  }, 0), [records]);
  const totalPago = useMemo(() => sumProcessoContratacaoTotalPago(records), [records]);
  const draftIssues = useMemo(() => getDraftIssues(draft, linkedItems, planoItems.length > 0), [draft, linkedItems, planoItems.length]);
  const editingRecord = useMemo(
    () => records.find((record) => record.id === editingRecordId) ?? null,
    [editingRecordId, records],
  );

  useEffect(() => {
    setLinkedItems((current) =>
      current.filter((item) => planoItems.some((planoItem) => planoItem.id === item.planoItemId)),
    );
  }, [planoItems]);

  function clearDraft(nextFeedback = 'Campos limpos para novo registro.') {
    setEditingRecordId(null);
    setLinkedItems([]);
    onClearDraft();
    setFeedback(nextFeedback);
  }

  function handleSaveRecord() {
    const issues = getDraftIssues(draft, linkedItems, planoItems.length > 0);
    if (issues.length) {
      setFeedback(`Preencha os campos mínimos antes de salvar: ${issues.join(', ')}.`);
      return;
    }

    const nextRecord = buildRecordFromDraft(draft, editingRecordId ?? createRecordId(), linkedItems);
    const nextRecords = editingRecordId
      ? records.map((record) => (record.id === editingRecordId ? nextRecord : record))
      : [...records, nextRecord];

    onRecordsChange(nextRecords);
    onClearDraft();
    setLinkedItems([]);
    setEditingRecordId(null);
    setFeedback(editingRecordId ? 'Alteração salva com sucesso.' : 'Contratação adicionada com sucesso.');
  }

  function handleEditRecord(record: ProcessoContratacaoRegistro) {
    setEditingRecordId(record.id);
    const { id: _recordId, itensVinculados: recordLinkedItems, ...draftRecord } = record;
    setLinkedItems(recordLinkedItems ?? []);
    onDraftReplace({
      ...draftRecord,
      valorTotalContratado: calculateProcessoContratacaoTotal(record.quantidadeContratada, record.valorUnitarioContratado) || record.valorTotalContratado,
    });
    setFeedback('Modo de edição ativado. Ajuste os campos e salve a alteração.');
  }

  function handleDeleteRecord(recordId: string) {
    if (!window.confirm('Excluir este registro de contratação?')) return;

    const nextRecords = records.filter((record) => record.id !== recordId);
    onRecordsChange(nextRecords);

    if (editingRecordId === recordId) {
      setEditingRecordId(null);
      onClearDraft();
    }

    setFeedback('Registro removido.');
  }

  function togglePlanoItem(item: PlanoItemForm) {
    setLinkedItems((current) => {
      if (current.some((linkedItem) => linkedItem.planoItemId === item.id)) {
        return current.filter((linkedItem) => linkedItem.planoItemId !== item.id);
      }

      return [...current, createLinkedItemFromPlanoItem(item)];
    });
  }

  function updateLinkedItem(itemId: string, field: keyof ContratacaoItemVinculado, value: string) {
    setLinkedItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  const summaryCards = [
    { label: 'Contratações cadastradas', value: String(records.length), hint: records.length ? 'Registros vinculados ao instrumento' : 'Nenhum registro salvo ainda' },
    { label: 'Soma do valor contratado', value: formatCurrency(totalContratado), hint: 'Base dos contratos consolidados' },
    { label: 'Soma do valor pago (OB)', value: formatCurrency(totalPago), hint: 'Liquidação já vinculada ao processo' },
  ];

  return (
    <div className="contratacao-module">
      <section className="contratacao-hero">
        <div className="contratacao-hero__copy">
          <div className="section-kicker">Cadastro inicial</div>
          <h3>Processo de Contratação</h3>
          <p>
            Esta página organiza um instrumento principal com vários registros de contratação vinculados, cada um
            com seu ciclo documental, financeiro e patrimonial.
          </p>
          <div className="contratacao-hero__chips" aria-label="Escopo da página">
            <span>1 instrumento</span>
            <span>N processos de contratação</span>
            <span>SEI, NE, contrato, OB e entrega</span>
          </div>
        </div>

        <aside className="contratacao-hero__panel">
          <span className="contratacao-hero__panel-label">Estado atual</span>
          <strong>{editingRecord ? 'Editando contratação' : 'Novo registro'}</strong>
          <small>{draftIssues.length ? `${draftIssues.length} pendência(s) mínima(s) no rascunho` : 'Rascunho pronto para salvar'}</small>
          <small>{calculatedTotal || 'Valor total calculado automaticamente'}</small>
        </aside>
      </section>

      <section className="contratacao-editor">
        <div className="contratacao-editor__head">
          <div>
            <div className="section-kicker">Formulário da contratação</div>
            <h3>{editingRecord ? 'Salvar alteração do registro selecionado' : 'Adicionar novo registro ao instrumento'}</h3>
            <p>
              Preencha os blocos na ordem natural de leitura. O valor total é calculado automaticamente a partir da
              quantidade e do valor unitário.
            </p>
          </div>

          <div className="contratacao-editor__actions">
            <button type="button" className="button button--primary" onClick={handleSaveRecord}>
              {editingRecord ? 'Salvar alteração' : 'Adicionar contratação'}
            </button>
            {editingRecord ? (
              <button type="button" className="button button--secondary" onClick={() => clearDraft('Edição cancelada.')}>
                Cancelar edição
              </button>
            ) : (
              <button type="button" className="button button--secondary" onClick={() => clearDraft()}>
                Limpar campos
              </button>
            )}
          </div>
        </div>

        {feedback ? (
          <div className="contratacao-feedback" role="status" aria-live="polite">
            <span className="material-symbols-outlined" aria-hidden="true">
              info
            </span>
            <p>{feedback}</p>
          </div>
        ) : null}

        <section className="contratacao-link-panel" aria-label="Vincular itens do Plano de Ação">
          <div className="contratacao-link-panel__head">
            <div>
              <div className="section-kicker">Vínculo com Plano de Ação</div>
              <h4>Selecione os itens aprovados que esta contratação executa</h4>
              <p>
                Cada contratação pode consumir um ou mais itens do plano. Esses vínculos alimentam o valor contratado e
                o saldo disponível do instrumento.
              </p>
            </div>
            <strong>{linkedItems.length} item(ns) vinculado(s)</strong>
          </div>

          {planoItems.length ? (
            <div className="contratacao-link-grid">
              {planoItems.map((item) => {
                const linkedItem = linkedItems.find((entry) => entry.planoItemId === item.id);
                const isLinked = Boolean(linkedItem);

                return (
                  <article key={item.id} className={isLinked ? 'contratacao-link-card is-linked' : 'contratacao-link-card'}>
                    <label className="contratacao-link-card__check">
                      <input type="checkbox" checked={isLinked} onChange={() => togglePlanoItem(item)} />
                      <span>
                        <strong>{item.item || 'Item sem descrição'}</strong>
                        <small>{item.categoriaItemObjeto || 'Categoria não informada'} · {item.valorTotalAutorizado || 'Valor não informado'}</small>
                      </span>
                    </label>

                    {linkedItem ? (
                      <div className="contratacao-link-card__fields">
                        <TextField
                          label="Quantidade contratada"
                          value={linkedItem.quantidadeContratada}
                          onChange={(value) => updateLinkedItem(linkedItem.id, 'quantidadeContratada', value)}
                        />
                        <CurrencyField
                          label="Valor unitário"
                          value={linkedItem.valorUnitarioContratado}
                          onChange={(value) => updateLinkedItem(linkedItem.id, 'valorUnitarioContratado', value)}
                        />
                        <CalculatedField
                          label="Valor total"
                          value={formatLinkedItemTotal(linkedItem)}
                        />
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="contratacao-empty contratacao-empty--compact">
              <strong>Nenhum item aprovado no Plano de Ação</strong>
              <p>Cadastre os itens do plano antes de vincular contratações ao saldo autorizado.</p>
            </div>
          )}
        </section>

        <div className="contratacao-sections">
          {contractingGroups.map((group) => (
            <FormSection
              key={group.title}
              className="contratacao-section"
              style={{ '--section-accent': group.accent } as CSSProperties}
              title={group.title}
              description={group.description}
            >
              {group.fields.map((field) => renderField(field, draft, onDraftChange, calculatedTotal))}
            </FormSection>
          ))}
        </div>
      </section>

      <section className="contratacao-table-card">
        <div className="contratacao-table-card__head">
          <div>
            <div className="section-kicker">Contratações cadastradas</div>
            <h3>Lista relacional vinculada ao instrumento</h3>
            <p>
              Cada linha representa um ciclo independente de contratação. Edite, exclua e acompanhe o resumo sem perder
              a leitura do processo.
            </p>
          </div>
          <div className="contratacao-table-card__count">
            <strong>{records.length}</strong>
            <span>registros salvos</span>
          </div>
        </div>

        {records.length ? (
          <div className="table-wrap contratacao-table-wrap">
            <table className="data-table contratacao-table">
              <thead>
                <tr>
                  <th>Processo SEI</th>
                  <th>Contrato nº</th>
                  <th>Ente Contratado</th>
                  <th>Itens vinculados</th>
                  <th>Valor Total Contratado</th>
                  <th>Status de processo</th>
                  <th>OB Valor</th>
                  <th>Unidade Beneficiada</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const isEditing = record.id === editingRecordId;

                  return (
                    <tr key={record.id} className={isEditing ? 'is-selected' : undefined}>
                      <td>
                        <strong className="contratacao-table__primary">{formatTextField(record.processoSei)}</strong>
                        <small>{formatTextField(record.neNumero)}</small>
                      </td>
                      <td>
                        <strong className="contratacao-table__primary">{formatTextField(record.contratoNumero)}</strong>
                        <small>{formatTextField(record.contratoSei)}</small>
                      </td>
                      <td>
                        <strong className="contratacao-table__primary">{formatTextField(record.enteContratado)}</strong>
                        <small>{formatTextField(record.cnpjContratado)}</small>
                      </td>
                      <td>
                        <strong className="contratacao-table__primary">
                          {(record.itensVinculados ?? []).length || '—'}
                        </strong>
                        <small>
                          {(record.itensVinculados ?? []).slice(0, 2).map((item) => item.itemDescricao).join(', ') || 'Sem vínculo'}
                        </small>
                      </td>
                      <td>
                        <strong className="contratacao-table__primary">{formatCurrencyField(record.valorTotalContratado)}</strong>
                        <small>{formatCurrencyField(record.valorUnitarioContratado)}</small>
                      </td>
                      <td>
                        <span className={`contratacao-status contratacao-status--${slugify(record.statusProcesso)}`}>
                          {formatTextField(record.statusProcesso)}
                        </span>
                      </td>
                      <td>
                        <strong className="contratacao-table__primary">{formatCurrencyField(record.obValor)}</strong>
                        <small>{formatTextField(record.obNumero)}</small>
                      </td>
                      <td>
                        <strong className="contratacao-table__primary">{formatTextField(record.unidadeBeneficiada)}</strong>
                        <small>{formatTextField(record.localizacao)}</small>
                      </td>
                      <td>
                        <div className="contratacao-table__actions">
                          <button type="button" className="button button--secondary contratacao-table__action" onClick={() => handleEditRecord(record)}>
                            <span className="material-symbols-outlined" aria-hidden="true">
                              edit
                            </span>
                            Editar
                          </button>
                          <button type="button" className="button button--secondary contratacao-table__action contratacao-table__action--danger" onClick={() => handleDeleteRecord(record.id)}>
                            <span className="material-symbols-outlined" aria-hidden="true">
                              delete
                            </span>
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="contratacao-empty">
            <strong>Nenhuma contratação cadastrada ainda</strong>
            <p>Use o formulário acima para criar o primeiro registro e começar a relação 1 instrumento / N processos.</p>
          </div>
        )}
      </section>

      <section className="contratacao-summary">
        <div className="contratacao-summary__head">
          <div>
            <div className="section-kicker">Resumo consolidado</div>
            <h3>Leitura executiva do instrumento</h3>
          </div>
          <p>O resumo consolida a relação inteira da contratação sem depender de planilha externa.</p>
        </div>

        <div className="contratacao-summary__grid">
          {summaryCards.map((card) => (
            <article key={card.label} className="contratacao-summary__card">
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.hint}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
