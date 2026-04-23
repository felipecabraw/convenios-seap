import { useEffect, useMemo, useRef, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { cadastroOptionSets, PrestacaoContasForm, PrestacaoItemForm } from '../../../data/cadastro';
import { statusTone } from '../../../data/processos-db';
import { CalculatedField, CurrencyField, DateField, FormSection, SelectField, TextAreaField, TextField } from '../fields';

function parseCurrency(value: string) {
  if (!value) return 0;
  const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPercent(value: number) {
  return `${value.toFixed(1).replace('.', ',')}%`;
}

function formatCompactCurrency(value: number) {
  if (!value) return formatCurrency(value);
  if (Math.abs(value) < 1000000) return formatCurrency(value);

  return `R$ ${(value / 1000000).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}M`;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function checklistStatus(items: PrestacaoItemForm[], predicate: (item: PrestacaoItemForm) => boolean) {
  return items.some(predicate) ? 'Completo' : 'Pendente';
}

function displayText(value: string, fallback: string) {
  return value.trim() ? value : fallback;
}

function displayCurrency(value: string, fallback = 'A definir') {
  return value.trim() ? formatCurrency(parseCurrency(value)) : fallback;
}

export function PrestacaoContasStep({
  data,
  items,
  totalGlobal,
  footer,
  onGlobalChange,
  onItemChange,
}: {
  data: PrestacaoContasForm;
  items: PrestacaoItemForm[];
  totalGlobal: string;
  footer: { status: string; deadline: string };
  onGlobalChange: <K extends keyof PrestacaoContasForm>(field: K, value: PrestacaoContasForm[K]) => void;
  onItemChange: (itemId: string, field: keyof PrestacaoItemForm, value: string) => void;
}) {
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.itemPlanoId ?? '');
  const itemDetailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!items.some((item) => item.itemPlanoId === selectedItemId)) {
      setSelectedItemId(items[0]?.itemPlanoId ?? '');
    }
  }, [items, selectedItemId]);

  const selectedItem = useMemo(
    () => items.find((item) => item.itemPlanoId === selectedItemId) ?? items[0] ?? null,
    [items, selectedItemId],
  );

  const totals = useMemo(() => {
    const totalExecutado = items.reduce((sum, item) => sum + parseCurrency(item.valorExecutadoItem), 0);
    const totalComprovado = items.reduce((sum, item) => sum + parseCurrency(item.valorComprovadoItem), 0);
    const totalGlosado = items.reduce((sum, item) => sum + parseCurrency(item.valorGlosadoItem), 0);
    const saldoNaoUtilizado = items.reduce((sum, item) => sum + parseCurrency(item.saldoNaoUtilizadoItem), 0);
    const valorGlobal = parseCurrency(totalGlobal);
    const aprovado = Math.max(totalComprovado - totalGlosado, 0);
    const saldoGlobal = Math.max(valorGlobal - totalExecutado, 0);
    const percentualExecutado = valorGlobal > 0 ? (totalExecutado / valorGlobal) * 100 : 0;
    const percentualComprovado = valorGlobal > 0 ? (totalComprovado / valorGlobal) * 100 : 0;
    const itensPrestados = items.filter((item) => parseCurrency(item.valorExecutadoItem) > 0).length;
    const itensPendentes = items.filter((item) => ['Pendente', 'Nao iniciado', 'Não iniciado'].includes(item.statusItemPrestacao)).length;
    const itensAprovados = items.filter((item) => ['Comprovado', 'Encerrado'].includes(item.statusItemPrestacao)).length;
    const itensGlosados = items.filter(
      (item) => item.statusItemPrestacao === 'Glosado' || parseCurrency(item.valorGlosadoItem) > 0,
    ).length;

    return {
      totalExecutado,
      totalComprovado,
      totalGlosado,
      saldoNaoUtilizado,
      aprovado,
      saldoGlobal,
      percentualExecutado,
      percentualComprovado,
      itensPrestados,
      itensPendentes,
      itensAprovados,
      itensGlosados,
    };
  }, [items, totalGlobal]);

  const valorGlobalNumber = useMemo(() => parseCurrency(totalGlobal), [totalGlobal]);
  const financialRingData = useMemo(() => [
    {
      name: 'Executado',
      value: totals.totalExecutado,
      color: '#0b2342',
    },
    {
      name: 'Saldo disponível',
      value: Math.max(valorGlobalNumber - totals.totalExecutado, 0),
      color: '#d6dbe4',
    },
  ], [totals.totalExecutado, valorGlobalNumber]);
  const financialSignals = useMemo(() => [
    {
      label: 'Executado',
      value: clampPercent(totals.percentualExecutado),
      tone: 'primary' as const,
    },
    {
      label: 'Comprovado',
      value: clampPercent(totals.percentualComprovado),
      tone: 'success' as const,
    },
    {
      label: 'Glosado',
      value: clampPercent(valorGlobalNumber > 0 ? (totals.totalGlosado / valorGlobalNumber) * 100 : 0),
      tone: 'warning' as const,
    },
    {
      label: 'Saldo',
      value: clampPercent(valorGlobalNumber > 0 ? ((valorGlobalNumber - totals.totalExecutado) / valorGlobalNumber) * 100 : 0),
      tone: 'neutral' as const,
    },
  ], [totals.percentualComprovado, totals.percentualExecutado, totals.totalExecutado, totals.totalGlosado, valorGlobalNumber]);
  const checklist = useMemo(
    () => [
      {
        label: 'Relatório financeiro',
        value: checklistStatus(items, (item) => Boolean(item.relatorioExecucaoItem || item.valorComprovadoItem)),
      },
      {
        label: 'Extratos bancários',
        value: checklistStatus(items, (item) => Boolean(item.extratoItem)),
      },
      {
        label: 'Conciliação e OB',
        value: checklistStatus(items, (item) => Boolean(item.ordemBancariaItem)),
      },
      {
        label: 'Notas fiscais',
        value: checklistStatus(items, (item) => Boolean(item.notaFiscalItem || item.reciboItem)),
      },
      {
        label: 'Evidências',
        value: checklistStatus(items, (item) => Boolean(item.fotoOuEvidenciaItem)),
      },
      {
        label: 'Parecer final',
        value: checklistStatus(items, (item) => Boolean(item.parecerItem || item.pendenciaDocumentalItem)),
      },
    ],
    [items],
  );
  const selectedItemIndex = Math.max(0, items.findIndex((item) => item.itemPlanoId === selectedItem?.itemPlanoId));
  const flowSections = [
    { href: '#prestacao-instrumento', index: '01', title: 'Processo', description: 'Seleção horizontal' },
    { href: '#prestacao-itens', index: '02', title: 'Itens', description: 'Prestação por linha' },
    { href: '#prestacao-financeiro', index: '03', title: 'Consolidação', description: 'Impacto no saldo' },
    { href: '#prestacao-global', index: '04', title: 'Base', description: 'Status e cronograma' },
    { href: '#prestacao-encerramento', index: '05', title: 'Encerramento', description: 'Glosas e devolução' },
  ];

  const selectedItemSummary = selectedItem
    ? [
        {
          label: 'Previsto',
          value: displayCurrency(selectedItem.valorTotalPrevisto),
        },
        {
          label: 'Executado',
          value: displayCurrency(selectedItem.valorExecutadoItem),
        },
        {
          label: 'Comprovado',
          value: displayCurrency(selectedItem.valorComprovadoItem),
        },
        {
          label: 'Saldo',
          value: displayCurrency(selectedItem.saldoNaoUtilizadoItem),
        },
      ]
    : [];

  function openItemPrestacao(itemId: string) {
    setSelectedItemId(itemId);
    window.requestAnimationFrame(() => {
      itemDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  const overviewCards = [
    {
      label: 'Itens do processo',
      value: String(items.length),
      hint: `${totals.itensPrestados} já receberam lançamento`,
    },
    {
      label: 'Saldo disponível',
      value: formatCurrency(totals.saldoGlobal),
      hint: 'reduzido automaticamente pelos itens executados',
    },
    {
      label: 'Valor executado',
      value: formatCurrency(totals.totalExecutado),
      hint: `${formatPercent(totals.percentualExecutado)} do valor global`,
    },
    {
      label: 'Item em edição',
      value: selectedItem ? displayText(selectedItem.itemPlanoDescricao, 'Item selecionado') : 'Nenhum item selecionado',
      hint: selectedItem ? displayText(selectedItem.statusItemPrestacao, 'Status pendente') : 'Escolha um item para lançar a prestação',
    },
  ];

  return (
    <div className="prestacao-step">
      <nav className="prestacao-flow-nav" aria-label="Atalhos da prestação">
        {flowSections.map((section) => (
          <a key={section.href} href={section.href} className="prestacao-flow-nav__item">
            <span className="prestacao-flow-nav__index">{section.index}</span>
            <span className="prestacao-flow-nav__text">
              <strong>{section.title}</strong>
              <small>{section.description}</small>
            </span>
          </a>
        ))}
      </nav>

      <section id="prestacao-itens" className="prestacao-anchor">
        <div className="prestacao-section-head prestacao-section-head--focus">
          <div>
            <div className="section-kicker">Itens do processo</div>
            <h3>Preste contas item a item e reduza o saldo do instrumento principal automaticamente.</h3>
            <p>Cada item aprovado do plano aparece aqui para conferência individual. Lance documentos e valores por linha, sem perder a visão do saldo consolidado.</p>
          </div>
        </div>

        <div className="prestacao-overview" aria-label="Resumo imediato da prestação por item">
          <div className="prestacao-overview__lead">
            <div className="section-kicker">Leitura rápida</div>
            <h4>O foco desta tela é a conferência por item vinculado ao processo.</h4>
            <p>Escolha um item na fila, registre os documentos e acompanhe a redução do saldo do instrumento em tempo real.</p>
            <div className="prestacao-mini-progress" aria-hidden="true">
              <span style={{ width: `${clampPercent((totals.itensPrestados / Math.max(items.length, 1)) * 100)}%` }} />
            </div>
          </div>

          <div className="prestacao-overview__cards">
            {overviewCards.map((card) => (
              <article key={card.label} className="prestacao-overview__card">
                <span>{card.label}</span>
                <strong title={card.value}>{card.value}</strong>
                <small>{card.hint}</small>
              </article>
            ))}
          </div>
        </div>

        <section className="prestacao-layout">
        <article className="prestacao-item-list">
          <div className="prestacao-item-list__head">
            <div className="section-kicker">Itens da prestação</div>
            <h4>Fila de conferência</h4>
            <p>Selecione um item para abrir documentos, pendências e conferências financeiras.</p>
          </div>
          <div className="prestacao-item-list__stack">
            {items.map((item) => {
              const isActive = item.itemPlanoId === selectedItemId;
              const plannedValue = parseCurrency(item.valorTotalPrevisto);
              const executedValue = parseCurrency(item.valorExecutadoItem);

              const progress = plannedValue > 0 ? clampPercent((executedValue / plannedValue) * 100) : 0;
              return (
                <button
                  key={item.itemPlanoId}
                  type="button"
                  className={isActive ? 'prestacao-item-card is-active' : 'prestacao-item-card'}
                  onClick={() => openItemPrestacao(item.itemPlanoId)}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <div className="prestacao-item-card__head">
                    <div className="prestacao-item-card__title">
                      <strong>{item.itemPlanoDescricao || 'Item sem descrição'}</strong>
                      <span>{item.categoriaItemObjeto || 'Categoria não informada'}</span>
                    </div>
                    <span className={`badge badge--${statusTone(item.statusItemPrestacao || 'Não iniciado')}`}>
                      {item.statusItemPrestacao || 'Não iniciado'}
                    </span>
                  </div>
                  <div className="prestacao-item-card__meta">
                    <span>Previsto: {displayCurrency(item.valorTotalPrevisto)}</span>
                    <span>Executado: {displayCurrency(item.valorExecutadoItem)}</span>
                    <span>Comprovado: {displayCurrency(item.valorComprovadoItem)}</span>
                    <span>Quantidade: {displayText(item.quantidadePrevista, 'A definir')}</span>
                  </div>
                  <div className="prestacao-item-card__progress" aria-hidden="true">
                    <span style={{ width: `${progress}%` }} />
                  </div>
                  <div className="prestacao-item-card__foot">
                    <small>{item.notaFiscalItem || item.reciboItem || 'Documento pendente'}</small>
                    <button
                      type="button"
                      className="prestacao-item-card__action"
                      onClick={(event) => {
                        event.stopPropagation();
                        openItemPrestacao(item.itemPlanoId);
                      }}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">manage_search</span>
                      {isActive ? 'Prestação aberta' : 'Abrir prestação'}
                    </button>
                  </div>
                </button>
              );
            })}
          </div>
        </article>

        <article ref={itemDetailRef} className="prestacao-item-detail">
          <div className="prestacao-item-detail__head">
            <div>
              <div className="section-kicker">Detalhe do item selecionado</div>
              <h4>{selectedItem?.itemPlanoDescricao || 'Nenhum item selecionado'}</h4>
              {selectedItem ? <p>Item {selectedItemIndex + 1} de {items.length} na fila de conferência.</p> : null}
            </div>
            {selectedItem ? (
              <span className={`badge badge--${statusTone(selectedItem.statusItemPrestacao)}`}>
                {selectedItem.statusItemPrestacao}
              </span>
            ) : null}
          </div>

          {selectedItem ? (
            <>
              <div className="prestacao-item-detail__metrics">
                {selectedItemSummary.map((metric) => (
                  <article key={metric.label} className="prestacao-item-detail__metric">
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </article>
                ))}
              </div>

              <FormSection
                title="Lançamento e conferência"
                description="Resumo do item, status operacional e valores comparativos."
              >
                <CalculatedField label="ID do item" value={selectedItem.itemPlanoId} span="quarter" />
                <CalculatedField label="Categoria" value={displayText(selectedItem.categoriaItemObjeto, 'A definir')} span="quarter" />
                <SelectField
                  label="Status do item"
                  value={selectedItem.statusItemPrestacao}
                  options={cadastroOptionSets.statusItemPrestacao}
                  onChange={(value) => onItemChange(selectedItem.itemPlanoId, 'statusItemPrestacao', value)}
                  span="half"
                />
                <CalculatedField
                  label="Quantidade prevista"
                  value={displayText(selectedItem.quantidadePrevista, 'A definir')}
                  span="quarter"
                />
                <TextField
                  label="Quantidade executada"
                  value={selectedItem.quantidadeExecutada}
                  onChange={(value) => onItemChange(selectedItem.itemPlanoId, 'quantidadeExecutada', value)}
                  span="quarter"
                />
                <CalculatedField
                  label="Valor unitário previsto"
                  value={displayText(selectedItem.valorUnitarioPrevisto, 'A definir')}
                  span="quarter"
                />
                <CalculatedField
                  label="Valor total previsto"
                  value={displayText(selectedItem.valorTotalPrevisto, 'A definir')}
                  span="quarter"
                />
                <CurrencyField
                  label="Débito lançado"
                  value={selectedItem.valorExecutadoItem}
                  onChange={(value) => onItemChange(selectedItem.itemPlanoId, 'valorExecutadoItem', value)}
                  span="quarter"
                />
                <CurrencyField
                  label="Valor comprovado"
                  value={selectedItem.valorComprovadoItem}
                  onChange={(value) => onItemChange(selectedItem.itemPlanoId, 'valorComprovadoItem', value)}
                  span="quarter"
                />
                <CurrencyField
                  label="Valor glosado"
                  value={selectedItem.valorGlosadoItem}
                  onChange={(value) => onItemChange(selectedItem.itemPlanoId, 'valorGlosadoItem', value)}
                  span="quarter"
                />
                <CurrencyField
                  label="Saldo não utilizado"
                  value={selectedItem.saldoNaoUtilizadoItem}
                  onChange={(value) => onItemChange(selectedItem.itemPlanoId, 'saldoNaoUtilizadoItem', value)}
                  span="quarter"
                />
              </FormSection>

              <FormSection
                title="Documentação do item"
                description="Comprovantes e peças obrigatórias associadas ao item do plano de trabalho."
              >
                <TextField
                  label="Nota fiscal"
                  value={selectedItem.notaFiscalItem}
                  onChange={(value) => onItemChange(selectedItem.itemPlanoId, 'notaFiscalItem', value)}
                  span="quarter"
                />
                <TextField
                  label="Recibo"
                  value={selectedItem.reciboItem}
                  onChange={(value) => onItemChange(selectedItem.itemPlanoId, 'reciboItem', value)}
                  span="quarter"
                />
                <TextField
                  label="Ordem bancária"
                  value={selectedItem.ordemBancariaItem}
                  onChange={(value) => onItemChange(selectedItem.itemPlanoId, 'ordemBancariaItem', value)}
                  span="quarter"
                />
                <TextField
                  label="Extrato"
                  value={selectedItem.extratoItem}
                  onChange={(value) => onItemChange(selectedItem.itemPlanoId, 'extratoItem', value)}
                  span="quarter"
                />
                <TextField
                  label="Relatório de execução"
                  value={selectedItem.relatorioExecucaoItem}
                  onChange={(value) => onItemChange(selectedItem.itemPlanoId, 'relatorioExecucaoItem', value)}
                  span="full"
                />
                <TextField
                  label="Foto ou evidência"
                  value={selectedItem.fotoOuEvidenciaItem}
                  onChange={(value) => onItemChange(selectedItem.itemPlanoId, 'fotoOuEvidenciaItem', value)}
                  span="half"
                />
                <TextField
                  label="Termo de recebimento"
                  value={selectedItem.termoRecebimentoItem}
                  onChange={(value) => onItemChange(selectedItem.itemPlanoId, 'termoRecebimentoItem', value)}
                  span="half"
                />
              </FormSection>

              <FormSection
                title="Parecer e ocorrências"
                description="Registre observações, pendências e conclusões finais do item."
              >
                <TextField
                  label="Parecer"
                  value={selectedItem.parecerItem}
                  onChange={(value) => onItemChange(selectedItem.itemPlanoId, 'parecerItem', value)}
                  span="full"
                />
                <TextAreaField
                  label="Observação do item"
                  value={selectedItem.observacaoItem}
                  onChange={(value) => onItemChange(selectedItem.itemPlanoId, 'observacaoItem', value)}
                  span="full"
                  rows={2}
                />
                <TextAreaField
                  label="Pendência documental"
                  value={selectedItem.pendenciaDocumentalItem}
                  onChange={(value) => onItemChange(selectedItem.itemPlanoId, 'pendenciaDocumentalItem', value)}
                  span="full"
                  rows={2}
                />
                <TextAreaField
                  label="Documentos vinculados"
                  value={selectedItem.documentosItem}
                  onChange={(value) => onItemChange(selectedItem.itemPlanoId, 'documentosItem', value)}
                  span="full"
                  rows={2}
                />
              </FormSection>
            </>
          ) : (
            <div className="empty-module-state">
              <strong>Nenhum item disponível</strong>
              <p>Cadastre itens em Plano de Trabalho para a prestação poder consolidar por linha.</p>
            </div>
          )}
        </article>
        </section>
      </section>

      <div id="prestacao-global" className="prestacao-anchor">
        <div className="prestacao-section-head">
          <div>
            <div className="section-kicker">Base da prestação</div>
            <h3>Organize a abertura, a janela temporal e a governança do processo.</h3>
            <p>Essas informações sustentam a leitura administrativa da prestação e ficam abaixo da conferência por item para não competir com o fluxo principal.</p>
          </div>
        </div>

        <div className="prestacao-support">
          <FormSection
            title="Identificação e status"
            description="Classificação macro da prestação e status de análise."
          >
            <SelectField
              label="Status da prestação"
              value={data.statusPrestacaoGlobal}
              options={cadastroOptionSets.statusPrestacaoGlobal}
              onChange={(value) => onGlobalChange('statusPrestacaoGlobal', value)}
              span="half"
            />
            <SelectField
              label="Tipo de prestação"
              value={data.tipoPrestacao}
              options={cadastroOptionSets.tipoPrestacao}
              onChange={(value) => onGlobalChange('tipoPrestacao', value)}
              span="half"
            />
            <SelectField
              label="Status da análise"
              value={data.statusAnaliseGlobal}
              options={cadastroOptionSets.statusAnaliseGlobal}
              onChange={(value) => onGlobalChange('statusAnaliseGlobal', value)}
              span="half"
            />
            <TextField
              label="Responsável pela prestação"
              value={data.responsavelPrestacao}
              onChange={(value) => onGlobalChange('responsavelPrestacao', value)}
              span="half"
            />
          </FormSection>

          <FormSection
            title="Cronograma da prestação"
            description="Delimitação temporal para protocolo, análise e conclusão."
          >
            <DateField
              label="Período de referência - início"
              value={data.periodoReferenciaInicio}
              onChange={(value) => onGlobalChange('periodoReferenciaInicio', value)}
              span="half"
            />
            <DateField
              label="Período de referência - fim"
              value={data.periodoReferenciaFim}
              onChange={(value) => onGlobalChange('periodoReferenciaFim', value)}
              span="half"
            />
            <DateField
              label="Data de protocolo"
              value={data.dataProtocolo}
              onChange={(value) => onGlobalChange('dataProtocolo', value)}
              span="third"
            />
            <DateField
              label="Data de análise"
              value={data.dataAnalise}
              onChange={(value) => onGlobalChange('dataAnalise', value)}
              span="third"
            />
            <DateField
              label="Data de conclusão"
              value={data.dataConclusao}
              onChange={(value) => onGlobalChange('dataConclusao', value)}
              span="third"
            />
          </FormSection>

          <FormSection
            title="Responsáveis e setor"
            description="Equipe e unidade responsáveis pela tramitação da prestação."
          >
            <SelectField
              label="Setor responsável"
              value={data.setorResponsavel}
              options={cadastroOptionSets.unidadesSistema}
              onChange={(value) => onGlobalChange('setorResponsavel', value)}
              span="full"
            />
          </FormSection>
        </div>
      </div>

      <section id="prestacao-financeiro" className="prestacao-finance-visual" aria-label="Consolidação financeira">
        <div className="prestacao-finance-visual__header">
          <div>
            <div className="section-kicker">Consolidação financeira</div>
            <h4>Saldo do instrumento após a prestação por item</h4>
            <p>O painel abaixo mostra como o saldo do instrumento se comporta com base nos lançamentos de cada item do plano.</p>
          </div>
          <div className="prestacao-finance-visual__headline">
            <strong>{formatCompactCurrency(valorGlobalNumber)}</strong>
            <span>valor global do instrumento</span>
          </div>
        </div>

        <div className="prestacao-finance-visual__body">
          <article className="prestacao-finance-visual__chart-card">
            <div className="prestacao-ring">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value) => (typeof value === 'number' ? formatCurrency(value) : String(value ?? ''))}
                    contentStyle={{
                      borderRadius: '14px',
                      border: '1px solid rgba(148, 163, 184, 0.22)',
                      boxShadow: '0 18px 34px rgba(10, 37, 71, 0.12)',
                    }}
                  />
                  <Pie
                    data={financialRingData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="72%"
                    outerRadius="92%"
                    paddingAngle={2}
                    stroke="none"
                  >
                    {financialRingData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="prestacao-ring__center">
                <strong>{formatPercent(totals.percentualExecutado)}</strong>
                <span>executado</span>
                <small>{formatCurrency(totals.totalExecutado)}</small>
              </div>
            </div>

            <div className="prestacao-finance-visual__legend">
              {financialRingData.map((slice) => (
                <div key={slice.name} className="prestacao-finance-visual__legend-item">
                  <span>
                    <i style={{ backgroundColor: slice.color }} />
                    {slice.name}
                  </span>
                  <strong>{formatCompactCurrency(slice.value)}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="prestacao-finance-visual__stack">
            <div className="prestacao-finance-visual__stat-row">
              <div>
                <span>Executado</span>
                <strong>{formatCurrency(totals.totalExecutado)}</strong>
              </div>
              <small>{formatPercent(totals.percentualExecutado)}</small>
            </div>
            <div className="prestacao-finance-visual__stat-row">
              <div>
                <span>Comprovado</span>
                <strong>{formatCurrency(totals.totalComprovado)}</strong>
              </div>
              <small>{formatPercent(totals.percentualComprovado)}</small>
            </div>
            <div className="prestacao-finance-visual__stat-row">
              <div>
                <span>Glosado</span>
                <strong>{formatCurrency(totals.totalGlosado)}</strong>
              </div>
              <small>{formatCompactCurrency(totals.totalGlosado)}</small>
            </div>
            <div className="prestacao-finance-visual__stat-row">
              <div>
                <span>Saldo disponível</span>
                <strong>{formatCurrency(totals.saldoGlobal)}</strong>
              </div>
              <small>{formatPercent(clampPercent(valorGlobalNumber > 0 ? (totals.saldoGlobal / valorGlobalNumber) * 100 : 0))}</small>
            </div>

            <div className="prestacao-finance-visual__signals">
              {financialSignals.map((signal) => (
                <div key={signal.label} className={`prestacao-finance-visual__signal prestacao-finance-visual__signal--${signal.tone}`}>
                  <div className="prestacao-finance-visual__signal-head">
                    <span>{signal.label}</span>
                    <strong>{formatPercent(signal.value)}</strong>
                  </div>
                  <div className="prestacao-finance-visual__signal-track">
                    <span style={{ width: `${signal.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <div id="prestacao-encerramento" className="prestacao-anchor">
        <div className="prestacao-section-head">
          <div>
            <div className="section-kicker">Consolidação e encerramento</div>
            <h3>Fechamento global, glosas e devolução em um único bloco decisório.</h3>
            <p>Registre o resultado final e o encerramento com leitura limpa para auditoria e acompanhamento.</p>
          </div>
        </div>
        <FormSection
          title="Conclusão global"
          description="Conclusão global, glosas, devolução e encerramento do processo."
        >
          <SelectField
            label="Resultado final global"
            value={data.resultadoFinalGlobal}
            options={cadastroOptionSets.resultadoFinalGlobal}
            onChange={(value) => onGlobalChange('resultadoFinalGlobal', value)}
            span="half"
          />
          <SelectField
            label="Conta encerrada"
            value={data.contaEncerrada}
            options={cadastroOptionSets.simNao}
            onChange={(value) => onGlobalChange('contaEncerrada', value)}
            span="half"
          />
          <CurrencyField
            label="Valor de devolução global"
            value={data.valorDevolucaoGlobal}
            onChange={(value) => onGlobalChange('valorDevolucaoGlobal', value)}
            span="half"
          />
          <DateField
            label="Data de devolução global"
            value={data.dataDevolucaoGlobal}
            onChange={(value) => onGlobalChange('dataDevolucaoGlobal', value)}
            span="half"
          />
          <TextAreaField
            label="Motivo da glosa"
            value={data.motivoGlosaGlobal}
            onChange={(value) => onGlobalChange('motivoGlosaGlobal', value)}
            span="full"
            rows={3}
          />
          <TextAreaField
            label="Observações finais"
            value={data.observacoesFinais}
            onChange={(value) => onGlobalChange('observacoesFinais', value)}
            span="full"
            rows={3}
          />
        </FormSection>
      </div>

      <section className="prestacao-closing-bar" aria-label="Resumo final da prestação">
        <article className="prestacao-closing-bar__card prestacao-closing-bar__card--primary">
          <span>Situação atual</span>
          <strong>{footer.status}</strong>
        </article>
        <article className="prestacao-closing-bar__card prestacao-closing-bar__card--secondary">
          <span>Prazo de vigência</span>
          <strong>{footer.deadline}</strong>
        </article>
        <article className="prestacao-closing-bar__card prestacao-closing-bar__card--success">
          <span>Documentação em análise</span>
          <strong>{checklistStatus(items, (item) => Boolean(item.notaFiscalItem || item.reciboItem || item.relatorioExecucaoItem))}</strong>
        </article>
      </section>

      <section className="prestacao-checklist">
        {checklist.map((entry) => (
          <article key={entry.label} className="prestacao-checklist__card">
            <span>{entry.label}</span>
            <strong>{entry.value}</strong>
          </article>
        ))}
      </section>
    </div>
  );
}











