import { useMemo, useState } from 'react';
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

  return (
    <section className="plano-module">
      <header className="plano-module__intro">
        <div className="plano-module__intro-copy">
          <div className="section-kicker">Plano de ação</div>
          <h3>Objetos vinculados ao instrumento</h3>
          <p>
            Cadastre um objeto por vez, acompanhe a lista consolidada e mantenha o plano organizado para revisão
            institucional.
          </p>
        </div>
        <div className="plano-module__intro-meta" aria-label="Resumo do plano">
          <div className="plano-module__intro-pill">
            <span>Total de objetos</span>
            <strong>{items.length}</strong>
          </div>
          <div className="plano-module__intro-pill">
            <span>Valor total autorizado</span>
            <strong>{items.length ? totalFormatado : 'Aguardando itens'}</strong>
          </div>
        </div>
      </header>

      <div className="plano-module__grid">
        <article className="plano-module__card plano-module__card--form">
          <div className="plano-module__card-head">
            <div>
              <div className="section-kicker section-kicker--detail">Cadastro do objeto</div>
              <h4>{isEditing ? 'Editar objeto' : 'Novo objeto'}</h4>
              <p>{message}</p>
            </div>
            <div className="plano-module__tag">1 instrumento · N objetos</div>
          </div>

          <div className="form-grid">
            <SelectField
              label="Categoria do Item / Objeto"
              value={draft.categoriaItemObjeto}
              options={categoriaOptions}
              onChange={(value) => updateDraft('categoriaItemObjeto', value)}
            />
            <TextField
              label="Item"
              value={draft.item}
              placeholder="Descrição objetiva do objeto"
              onChange={(value) => updateDraft('item', value)}
              span="full"
            />
            <TextField
              label="Quantidade"
              value={draft.quantidade}
              type="number"
              placeholder="0"
              onChange={(value) => updateDraft('quantidade', value)}
            />
            <TextField
              label="Unidade de Medida"
              value={draft.unidadeMedida}
              placeholder="Ex.: unidade, serviço, kit"
              onChange={(value) => updateDraft('unidadeMedida', value)}
            />
            <CurrencyField
              label="Valor Unitário Autorizado"
              value={draft.valorUnitarioAutorizado}
              onChange={(value) => updateDraft('valorUnitarioAutorizado', value)}
            />
            <CalculatedField
              label="Valor Total Autorizado"
              value={draftTotal}
              hint="Calculado automaticamente a partir da quantidade e do valor unitário"
            />
            <SelectField
              label="Fruto de ajuste?"
              value={draft.frutoDeAjuste}
              options={yesNoOptions}
              onChange={(value) => updateDraft('frutoDeAjuste', value)}
            />
            <SelectField
              label="Monitorado?"
              value={draft.monitorado}
              options={yesNoOptions}
              onChange={(value) => updateDraft('monitorado', value)}
            />
            <FileField
              label="Documento de Autorização"
              value={draft.documentoAutorizacao}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              hint="Anexe um arquivo ou referência documental vinculada ao item."
              onChange={(value) => updateDraft('documentoAutorizacao', value)}
              span="full"
            />
          </div>

          <div className="plano-module__actions">
            <button type="button" className="button button--primary" onClick={persistDraft}>
              {isEditing ? 'Salvar alteração' : 'Adicionar objeto'}
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

        <article className="plano-module__card plano-module__card--list">
          <div className="plano-module__card-head">
            <div>
              <div className="section-kicker section-kicker--detail">Objetos cadastrados</div>
              <h4>Lista relacional do plano</h4>
              <p>Edite ou remova cada objeto individualmente sem perder a visão consolidada do instrumento.</p>
            </div>
            <div className="plano-module__tag plano-module__tag--subtle">{rows.length} registros</div>
          </div>

          <div className="plano-module__table-wrap">
            <table className="plano-module__table">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Item</th>
                  <th>Qtd.</th>
                  <th>Unidade</th>
                  <th>Unitário</th>
                  <th>Total</th>
                  <th>Fruto ajuste</th>
                  <th>Monitorado</th>
                  <th>Documento</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.length ? (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.categoriaItemObjeto}</td>
                      <td>
                        <div className="plano-module__cell-primary">{row.item}</div>
                      </td>
                      <td>{row.quantidade}</td>
                      <td>{row.unidadeMedida}</td>
                      <td>{formatCurrencyForDisplay(row.valorUnitarioAutorizado)}</td>
                      <td>
                        <strong className="plano-module__money">{formatCurrencyForDisplay(row.valorTotalAutorizado)}</strong>
                      </td>
                      <td>{row.frutoDeAjuste}</td>
                      <td>{row.monitorado}</td>
                      <td>{row.documentoAutorizacao}</td>
                      <td>
                        <div className="plano-module__row-actions">
                          <button type="button" className="dashboard-row-action" onClick={() => populateDraft(items.find((item) => item.id === row.id)!)} aria-label={`Editar ${row.item}`}>
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button type="button" className="dashboard-row-action dashboard-row-action--danger" onClick={() => removeItem(row.id)} aria-label={`Excluir ${row.item}`}>
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10}>
                      <div className="plano-empty-state">
                        <strong>Nenhum objeto cadastrado</strong>
                        <p>Use o formulário ao lado para inserir o primeiro item do plano.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <div className="plano-module__summary">
        <div>
          <span>Total de objetos cadastrados</span>
          <strong>{items.length}</strong>
        </div>
        <div>
          <span>Soma total dos valores autorizados</span>
          <strong>{items.length ? totalFormatado : 'Aguardando itens'}</strong>
        </div>
      </div>
    </section>
  );
}
