import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  calculatePlanoItemTotal,
  cadastroOptionSets,
  PlanoItemForm,
  PlanoObjetoForm,
  createPlanoItem,
  SelectOption,
} from '../../data/cadastro';
import { CalculatedField, CurrencyField, FileField, SelectField, TextField } from './fields';

type PlanoRow = {
  id: string;
  categoriaItemObjeto: string;
  item: string;
  quantidade: string;
  unidadeMedida: string;
  valorUnitarioAutorizado: string;
  valorTotalAutorizado: string;
  frutoDeAjuste: string;
  documentoAutorizacao: string;
  monitorado: string;
};

type ItemTableProps = {
  items: PlanoItemForm[];
  onItemsChange: (items: PlanoItemForm[]) => void;
};

const categoriaOptions: readonly SelectOption[] = [
  { value: 'Bem', label: 'Bem' },
  { value: 'Serviço', label: 'Serviço' },
];

const yesNoOptions = cadastroOptionSets.frutoDeAjuste;

function createDraft(): PlanoObjetoForm {
  return {
    id: '',
    categoriaItemObjeto: '',
    item: '',
    quantidade: '',
    unidadeMedida: '',
    valorUnitarioAutorizado: '',
    valorTotalAutorizado: '',
    frutoDeAjuste: 'Não',
    documentoAutorizacao: '',
    monitorado: 'Sim',
  };
}

function formatCurrencyForDisplay(value: string) {
  return value || 'A definir';
}

function toRow(item: PlanoItemForm): PlanoRow {
  return {
    id: item.id,
    categoriaItemObjeto: item.categoriaItemObjeto || 'A definir',
    item: item.item || 'Sem descrição',
    quantidade: item.quantidade || '0',
    unidadeMedida: item.unidadeMedida || 'A definir',
    valorUnitarioAutorizado: item.valorUnitarioAutorizado || 'A definir',
    valorTotalAutorizado: item.valorTotalAutorizado || calculatePlanoItemTotal(item.quantidade, item.valorUnitarioAutorizado),
    frutoDeAjuste: item.frutoDeAjuste || 'Não',
    documentoAutorizacao: item.documentoAutorizacao || 'Sem documento',
    monitorado: item.monitorado || 'Não',
  };
}

function createFullItem(draft: PlanoObjetoForm, existing?: PlanoItemForm): PlanoItemForm {
  const base = existing ?? createPlanoItem();
  const total = calculatePlanoItemTotal(draft.quantidade, draft.valorUnitarioAutorizado);

  return {
    ...base,
    id: draft.id || existing?.id || base.id,
    categoriaItemObjeto: draft.categoriaItemObjeto,
    item: draft.item,
    quantidade: draft.quantidade,
    unidadeMedida: draft.unidadeMedida,
    valorUnitarioAutorizado: draft.valorUnitarioAutorizado,
    valorTotalAutorizado: total || draft.valorTotalAutorizado,
    frutoDeAjuste: draft.frutoDeAjuste,
    documentoAutorizacao: draft.documentoAutorizacao,
    monitorado: draft.monitorado,
  };
}

export function ItemTable({ items, onItemsChange }: ItemTableProps) {
  const [draft, setDraft] = useState<PlanoObjetoForm>(createDraft());
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [message, setMessage] = useState('Cadastre um objeto por vez e mantenha a leitura do plano objetiva.');
  const [searchQuery, setSearchQuery] = useState('');

  const totalAutorizado = useMemo(
    () =>
      items.reduce((sum, item) => {
        const total = item.valorTotalAutorizado || calculatePlanoItemTotal(item.quantidade, item.valorUnitarioAutorizado);
        const numeric = Number(String(total).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
        return sum + (Number.isFinite(numeric) ? numeric : 0);
      }, 0),
    [items],
  );

  const totalFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAutorizado);
  const draftTotal = calculatePlanoItemTotal(draft.quantidade, draft.valorUnitarioAutorizado);
  const isEditing = Boolean(editingItemId);

  function updateDraft<K extends keyof PlanoObjetoForm>(field: K, value: PlanoObjetoForm[K]) {
    setDraft((current) => ({
      ...current,
      [field]: field === 'valorTotalAutorizado' ? draftTotal || value : value,
    }));
  }

  function resetDraft() {
    setDraft(createDraft());
    setEditingItemId(null);
    setMessage('Campos limpos. Pronto para cadastrar um novo objeto.');
  }

  function populateDraft(item: PlanoItemForm) {
    setEditingItemId(item.id);
    setDraft({
      id: item.id,
      categoriaItemObjeto: item.categoriaItemObjeto || '',
      item: item.item || '',
      quantidade: item.quantidade || '',
      unidadeMedida: item.unidadeMedida || '',
      valorUnitarioAutorizado: item.valorUnitarioAutorizado || '',
      valorTotalAutorizado: item.valorTotalAutorizado || calculatePlanoItemTotal(item.quantidade, item.valorUnitarioAutorizado),
      frutoDeAjuste: item.frutoDeAjuste || 'Não',
      documentoAutorizacao: item.documentoAutorizacao || '',
      monitorado: item.monitorado || 'Sim',
    });
    setMessage(`Editando ${item.item || 'objeto selecionado'}.`);
  }

  function persistDraft() {
    const required = [
      draft.categoriaItemObjeto,
      draft.item,
      draft.quantidade,
      draft.unidadeMedida,
      draft.valorUnitarioAutorizado,
      draft.documentoAutorizacao,
      draft.monitorado,
    ];

    if (required.some((value) => !String(value).trim())) {
      setMessage('Preencha os campos obrigatórios antes de salvar o objeto.');
      return;
    }

    const existing = editingItemId ? items.find((item) => item.id === editingItemId) : undefined;
    const nextId = editingItemId ?? `item-${Date.now()}`;
    const nextItem = createFullItem({ ...draft, id: nextId }, existing);
    const nextItems = editingItemId
      ? items.map((item) => (item.id === editingItemId ? nextItem : item))
      : [...items, nextItem];

    onItemsChange(nextItems);
    resetDraft();
    setMessage(editingItemId ? 'Objeto atualizado com sucesso.' : 'Objeto adicionado ao plano.');
  }

  function removeItem(itemId: string) {
    const nextItems = items.filter((item) => item.id !== itemId);
    onItemsChange(nextItems);

    if (editingItemId === itemId) {
      resetDraft();
    }

    setMessage('Objeto removido da lista.');
  }

  const rows = items.map(toRow);
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredRows = normalizedSearch
    ? rows.filter((row) =>
        [row.categoriaItemObjeto, row.item, row.documentoAutorizacao, row.monitorado]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : rows;
  const monitoredCount = rows.filter((row) => row.monitorado === 'Sim').length;
  const notMonitoredCount = Math.max(rows.length - monitoredCount, 0);
  const executionPercent = rows.length ? Math.round((monitoredCount / rows.length) * 100) : 0;
  const remainingPercent = Math.max(0, 100 - executionPercent);
  const categoryTotals = rows.reduce<Record<string, number>>((acc, row) => {
    const value = Number(
      String(row.valorTotalAutorizado)
        .replace(/[^\d,.-]/g, '')
        .replace(/\./g, '')
        .replace(',', '.'),
    );
    const category = row.categoriaItemObjeto || 'Outros';
    acc[category] = (acc[category] ?? 0) + (Number.isFinite(value) ? value : 0);
    return acc;
  }, {});
  const categoryEntries = Object.entries(categoryTotals).slice(0, 6);
  const donutStops = buildItemTableDonutStops(categoryEntries.map(([, value]) => value), totalAutorizado);

  return (
    <section className="plan-work-step">
      <section className="plan-work-kpi-strip" aria-label="Indicadores do plano">
        <article><span>Valor Global</span><strong>{items.length ? totalFormatado : 'R$ 0,00'}</strong></article>
        <article><span>Total do Plano de Trabalho</span><strong>{items.length ? totalFormatado : 'R$ 0,00'}</strong></article>
        <article><span>Executado (monitorado)</span><strong className="is-success">{executionPercent}%</strong></article>
        <article><span>Previsto (restante)</span><strong className="is-warning">{remainingPercent}%</strong></article>
        <article><span>Itens do Plano</span><strong>{rows.length}</strong></article>
        <article><span>Itens Concluídos</span><strong>{monitoredCount} ({executionPercent}%)</strong></article>
      </section>

      <section className="plan-work-body plan-work-body--step">
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
              <button type="button" className="plan-work-button plan-work-button--compact plan-work-button--primary" onClick={() => document.getElementById('novo-item-plano')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                <span className="material-symbols-outlined" aria-hidden="true">add</span>
                Novo item
              </button>
            </div>
          </div>

          <div className="plan-work-table-wrap">
            <table className="plan-work-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qtd.</th>
                  <th>Unitário</th>
                  <th>Total</th>
                  <th>Monitorado</th>
                  <th>Documento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length ? (
                  filteredRows.map((row, index) => (
                    <tr key={row.id}>
                      <td>
                        <div className="plan-work-item-cell">
                          <span>{String(index + 1).padStart(2, '0')}</span>
                          <div>
                            <strong>{row.item}</strong>
                            <small className={`plan-work-category ${planStepCategoryClass(row.categoriaItemObjeto)}`}>{row.categoriaItemObjeto}</small>
                          </div>
                        </div>
                      </td>
                      <td>{row.quantidade}</td>
                      <td>{formatCurrencyForDisplay(row.valorUnitarioAutorizado)}</td>
                      <td>
                        <strong>{formatCurrencyForDisplay(row.valorTotalAutorizado)}</strong>
                      </td>
                      <td><span className={row.monitorado === 'Sim' ? 'plan-work-status is-yes' : 'plan-work-status is-no'}>{row.monitorado}</span></td>
                      <td><span className="plan-work-doc">{row.documentoAutorizacao}</span></td>
                      <td>
                        <div className="plan-work-row-actions">
                          <button type="button" onClick={() => populateDraft(items.find((item) => item.id === row.id)!)} aria-label={`Editar ${row.item}`}>
                            <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                          </button>
                          <button type="button" onClick={() => removeItem(row.id)} aria-label={`Excluir ${row.item}`}>
                            <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <div className="plano-empty-state">
                        <strong>Nenhum objeto cadastrado</strong>
                        <p>Use o formulário abaixo para inserir o primeiro item do plano.</p>
                      </div>
                    </td>
                  </tr>
                )}
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
              <div className="plan-work-donut" style={{ '--plan-donut': donutStops } as CSSProperties}>
                <div>
                  <strong>{items.length ? totalFormatado : 'R$ 0,00'}</strong>
                  <span>Total do plano</span>
                </div>
              </div>
              <div className="plan-work-legend">
                {categoryEntries.length ? categoryEntries.map(([label, value], index) => (
                  <div key={label} className={`plan-work-legend__item ${planStepLegendClass(index)}`}>
                    <span>{label}</span>
                    <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}</strong>
                  </div>
                )) : (
                  <div className="plan-work-legend__item is-gray">
                    <span>Sem itens</span>
                    <strong>R$ 0,00</strong>
                  </div>
                )}
              </div>
            </div>
          </article>

          <article className="plan-work-side-card">
            <h3>Indicadores de execução</h3>
            <dl className="plan-work-indicators">
              <div><dt>Avanço físico</dt><dd className="is-success">{executionPercent}%</dd></div>
              <div><dt>Itens concluídos</dt><dd>{monitoredCount} de {rows.length}</dd></div>
              <div><dt>Itens em execução</dt><dd>{notMonitoredCount}</dd></div>
              <div><dt>Acompanhamentos realizados</dt><dd>{monitoredCount}</dd></div>
            </dl>
          </article>

          <article className="plan-work-side-card">
            <h3>Observações</h3>
            <p>{message}</p>
          </article>
        </aside>
      </section>

      <article id="novo-item-plano" className="plan-work-form-card">
        <div className="plan-work-table-card__head">
          <div>
            <h3>{isEditing ? 'Editar item do plano' : 'Novo item do plano'}</h3>
            <p>{message}</p>
          </div>
          <span className="plan-work-form-badge">1 instrumento · N itens</span>
        </div>

        <div className="form-grid">
          <SelectField label="Categoria do Item / Objeto" value={draft.categoriaItemObjeto} options={categoriaOptions} onChange={(value) => updateDraft('categoriaItemObjeto', value)} />
          <TextField label="Item" value={draft.item} placeholder="Descrição objetiva do objeto" onChange={(value) => updateDraft('item', value)} span="full" />
          <TextField label="Quantidade" value={draft.quantidade} type="number" placeholder="0" onChange={(value) => updateDraft('quantidade', value)} />
          <TextField label="Unidade de Medida" value={draft.unidadeMedida} placeholder="Ex.: unidade, serviço, kit" onChange={(value) => updateDraft('unidadeMedida', value)} />
          <CurrencyField label="Valor Unitário Autorizado" value={draft.valorUnitarioAutorizado} onChange={(value) => updateDraft('valorUnitarioAutorizado', value)} />
          <CalculatedField label="Valor Total Autorizado" value={draftTotal} hint="Calculado automaticamente" />
          <SelectField label="Fruto de ajuste?" value={draft.frutoDeAjuste} options={yesNoOptions} onChange={(value) => updateDraft('frutoDeAjuste', value)} />
          <SelectField label="Monitorado?" value={draft.monitorado} options={yesNoOptions} onChange={(value) => updateDraft('monitorado', value)} />
          <FileField label="Documento de Autorização" value={draft.documentoAutorizacao} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" hint="Anexe um arquivo ou referência documental vinculada ao item." onChange={(value) => updateDraft('documentoAutorizacao', value)} span="full" />
        </div>

        <div className="plano-module__actions">
          <button type="button" className="button button--primary" onClick={persistDraft}>
            {isEditing ? 'Salvar alteração' : 'Adicionar item'}
          </button>
          <button type="button" className="button button--secondary" onClick={resetDraft}>
            Limpar campos
          </button>
          {isEditing ? (
            <button type="button" className="ghost-link" onClick={resetDraft}>
              Cancelar edição
            </button>
          ) : null}
        </div>
      </article>
    </section>
  );
}

function buildItemTableDonutStops(values: number[], total: number) {
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

function planStepCategoryClass(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes('bem')) return 'is-equipment';
  if (normalized.includes('serv')) return 'is-service';
  return 'is-muted';
}

function planStepLegendClass(index: number) {
  return ['is-blue', 'is-green', 'is-yellow', 'is-purple', 'is-orange', 'is-gray'][index % 6];
}
