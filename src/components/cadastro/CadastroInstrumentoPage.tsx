import { useEffect, useMemo, useState } from 'react';
import {
  AjustePtForm,
  cadastroInitialFormData,
  CadastroInstrumentoFormData,
  cadastroSteps,
  DadosGeraisForm,
  DocumentoForm,
  FiltrosForm,
  GestaoInstrumentoForm,
  PlanoItemForm,
  PrestacaoItemForm,
  ProcessoContratacaoForm,
  ProcessoContratacaoRegistro,
  calculateProcessoContratacaoTotal,
  createProcessoContratacaoDraft,
  createPrestacaoItemFromPlanoItem,
  validateCadastroForm,
} from '../../data/cadastro';
import { CadastroStepper } from './CadastroStepper';
import { AjustePtStep } from './steps/AjustePtStep';
import { DadosGeraisStep } from './steps/DadosGeraisStep';
import { DocumentosStep } from './steps/DocumentosStep';
import { FiltrosStep } from './steps/FiltrosStep';
import { GestaoInstrumentoStep } from './steps/GestaoInstrumentoStep';
import { PlanoTrabalhoStep } from './steps/PlanoTrabalhoStep';
import { ProcessoContratacaoStep } from './steps/ProcessoContratacaoStep';

function parseCurrencyValue(value: string) {
  if (!value) return 0;
  const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatCurrency(value: number) {
  if (value === 0) return '';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatPercent(value: number) {
  if (value === 0) return '';
  return `${value.toFixed(1).replace('.', ',')}%`;
}

function diffInDays(date: string) {
  if (!date) return '';
  const target = new Date(`${date}T00:00:00`);
  if (Number.isNaN(target.getTime())) return '';
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.ceil((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return `${diff} dias`;
}

function clampCurrency(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function parseCurrency(value: string) {
  if (!value) return 0;
  const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatCurrencyValue(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPercentValue(value: number) {
  return `${value.toFixed(1).replace('.', ',')}%`;
}

function calculateDadosGeraisDerived(dadosGerais: DadosGeraisForm, totalAutorizado: number, totalContratado: number) {
  const saldoConta = parseCurrencyValue(dadosGerais.saldoConta);
  const valorGlobal = parseCurrencyValue(dadosGerais.valorGlobal);
  const recursoExecutado = parseCurrencyValue(dadosGerais.recursoExecutado);
  const rendimentoAutorizado = parseCurrencyValue(dadosGerais.rendimentoAplicacaoAutorizado);
  const saldoEconomicidade = clampCurrency(totalAutorizado - totalContratado);
  const rendimentoAplicacaoExistente = clampCurrency(saldoConta - totalContratado - saldoEconomicidade - rendimentoAutorizado);
  const percentualExecutado = valorGlobal > 0 ? (recursoExecutado / valorGlobal) * 100 : 0;

  return {
    diasClausulaSuspensiva: diffInDays(dadosGerais.prazoFinalClausulaSuspensiva),
    diasRestantes: diffInDays(dadosGerais.vigenciaFinal),
    saldoEconomicidade: formatCurrency(saldoEconomicidade),
    rendimentoAplicacaoExistente: formatCurrency(rendimentoAplicacaoExistente),
    percentualExecutado: formatPercent(percentualExecutado),
  };
}

function syncPrestacaoItems(
  planoItems: PlanoItemForm[],
  prestacaoItems: PrestacaoItemForm[],
): PrestacaoItemForm[] {
  const currentById = new Map(prestacaoItems.map((item) => [item.itemPlanoId, item]));

  return planoItems.map((item) => {
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

function updatePlanoItems(current: CadastroInstrumentoFormData, nextItems: PlanoItemForm[]) {
  return {
    ...current,
    planoTrabalho: {
      ...current.planoTrabalho,
      itens: nextItems,
    },
  };
}

export function CadastroInstrumentoPage({
  onSave,
  initialData,
}: {
  onSave: (data: CadastroInstrumentoFormData) => void;
  initialData?: CadastroInstrumentoFormData;
}) {
  const steps = cadastroSteps;
  const firstStep = steps[0]!;
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<CadastroInstrumentoFormData>(initialData ?? cadastroInitialFormData);

  useEffect(() => {
    setFormData(initialData ?? cadastroInitialFormData);
    setActiveStep(0);
  }, [initialData]);

  const calculated = useMemo(() => {
    const totalAutorizado = formData.planoTrabalho.itens.reduce(
      (sum, item) => sum + parseCurrencyValue(item.valorTotalAutorizado),
      0,
    );
    const totalContratado = parseCurrencyValue(formData.processoContratacao.valorTotalContratado);
    const derived = calculateDadosGeraisDerived(formData.dadosGerais, totalAutorizado, totalContratado);

    return {
      ...derived,
      valorTotalAutorizado: formatCurrency(totalAutorizado),
    };
  }, [formData]);

  const resolvedPrestacaoItems = useMemo(
    () => syncPrestacaoItems(formData.planoTrabalho.itens, formData.prestacaoContas.itens),
    [formData.planoTrabalho.itens, formData.prestacaoContas.itens],
  );
  const validation = useMemo(() => validateCadastroForm(formData), [formData]);
  const currentStepMissingCount =
    validation.steps.find((step) => step.key === (steps[activeStep]?.key ?? firstStep.key))?.missing?.length ?? 0;
  const firstIncompleteStepIndex = validation.firstIncompleteStep
    ? steps.findIndex((step) => step.key === validation.firstIncompleteStep)
    : -1;

  const prestacaoTotals = useMemo(() => {
    const totalExecutado = resolvedPrestacaoItems.reduce((sum, item) => sum + parseCurrency(item.valorExecutadoItem), 0);
    const totalComprovado = resolvedPrestacaoItems.reduce((sum, item) => sum + parseCurrency(item.valorComprovadoItem), 0);
    const totalGlosado = resolvedPrestacaoItems.reduce((sum, item) => sum + parseCurrency(item.valorGlosadoItem), 0);
    const saldoNaoUtilizado = resolvedPrestacaoItems.reduce(
      (sum, item) => sum + parseCurrency(item.saldoNaoUtilizadoItem),
      0,
    );
    const valorGlobal = parseCurrency(formData.dadosGerais.valorGlobal);
    const totalAprovado = Math.max(totalComprovado - totalGlosado, 0);
    const saldoGlobalDisponivel = Math.max(valorGlobal - totalExecutado, 0);
    const percentualExecutado = valorGlobal > 0 ? (totalExecutado / valorGlobal) * 100 : 0;
    const percentualComprovado = valorGlobal > 0 ? (totalComprovado / valorGlobal) * 100 : 0;
    const totalPrestados = resolvedPrestacaoItems.filter((item) => parseCurrency(item.valorExecutadoItem) > 0).length;
    const totalPendentes = resolvedPrestacaoItems.filter((item) =>
      ['Pendente', 'Nao iniciado'].includes(item.statusItemPrestacao),
    ).length;

    return {
      totalExecutado,
      totalComprovado,
      totalGlosado,
      saldoNaoUtilizado,
      totalAprovado,
      saldoGlobalDisponivel,
      percentualExecutado,
      percentualComprovado,
      totalPrestados,
      totalPendentes,
    };
  }, [formData.dadosGerais.valorGlobal, resolvedPrestacaoItems]);

  function updateDadosGerais<K extends keyof DadosGeraisForm>(field: K, value: DadosGeraisForm[K]) {
    setFormData((current) => {
      const nextDadosGerais = {
        ...current.dadosGerais,
        [field]: value,
      };
      const totalAutorizado = current.planoTrabalho.itens.reduce(
        (sum, item) => sum + parseCurrencyValue(item.valorTotalAutorizado),
        0,
      );
      const totalContratado = parseCurrencyValue(current.processoContratacao.valorTotalContratado);
      const derived = calculateDadosGeraisDerived(nextDadosGerais, totalAutorizado, totalContratado);

      return {
        ...current,
        dadosGerais: {
          ...nextDadosGerais,
          diasRestanteClausulaSuspensiva: derived.diasClausulaSuspensiva,
          diasRestantes: derived.diasRestantes,
          saldoEconomicidade: derived.saldoEconomicidade,
          rendimentoAplicacaoExistente: derived.rendimentoAplicacaoExistente,
          percentualExecutado: derived.percentualExecutado,
        },
      };
    });
  }

  function updateProcessoContratacao<K extends keyof ProcessoContratacaoForm>(
    field: K,
    value: ProcessoContratacaoForm[K],
  ) {
    setFormData((current) => ({
      ...current,
      processoContratacao: {
        ...current.processoContratacao,
        [field]: value,
      },
    }));
  }

  function replaceProcessoContratacaoDraft(nextDraft: ProcessoContratacaoForm) {
    setFormData((current) => ({
      ...current,
      processoContratacao: nextDraft,
    }));
  }

  function updateProcessoContratacaoRegistros(nextRecords: ProcessoContratacaoRegistro[]) {
    setFormData((current) => ({
      ...current,
      processoContratacaoRegistros: nextRecords,
    }));
  }

  function updateGestao<K extends keyof GestaoInstrumentoForm>(field: K, value: GestaoInstrumentoForm[K]) {
    setFormData((current) => ({
      ...current,
      gestaoInstrumento: {
        ...current.gestaoInstrumento,
        [field]: value,
      },
    }));
  }

  function updateAjustePt<K extends keyof AjustePtForm>(field: K, value: AjustePtForm[K]) {
    setFormData((current) => ({
      ...current,
      ajustePt: {
        ...current.ajustePt,
        [field]: value,
      },
    }));
  }

  function updateDocumentos<K extends keyof DocumentoForm>(field: K, value: DocumentoForm[K]) {
    setFormData((current) => ({
      ...current,
      documentos: {
        ...current.documentos,
        [field]: value,
      },
    }));
  }

  function updateFiltros<K extends keyof FiltrosForm>(field: K, value: FiltrosForm[K]) {
    setFormData((current) => ({
      ...current,
      filtros: {
        ...current.filtros,
        [field]: value,
      },
    }));
  }

  const syncCalculatedFields = {
    ...formData,
    processoContratacao: {
      ...formData.processoContratacao,
      valorTotalContratado:
        calculateProcessoContratacaoTotal(
          formData.processoContratacao.quantidadeContratada,
          formData.processoContratacao.valorUnitarioContratado,
        ) || formData.processoContratacao.valorTotalContratado,
    },
    dadosGerais: {
      ...formData.dadosGerais,
      diasRestanteClausulaSuspensiva: calculated.diasClausulaSuspensiva,
      diasRestantes: calculated.diasRestantes,
      saldoEconomicidade: calculated.saldoEconomicidade,
      rendimentoAplicacaoExistente: calculated.rendimentoAplicacaoExistente,
      percentualExecutado: calculated.percentualExecutado,
    },
    prestacaoContas: {
      ...formData.prestacaoContas,
      itens: resolvedPrestacaoItems,
      valorGlobalExecutado: formatCurrencyValue(prestacaoTotals.totalExecutado),
      valorGlobalComprovado: formatCurrencyValue(prestacaoTotals.totalComprovado),
      valorGlobalGlosado: formatCurrencyValue(prestacaoTotals.totalGlosado),
      valorGlobalAprovado: formatCurrencyValue(prestacaoTotals.totalAprovado),
      valorGlobalADevolver: formatCurrencyValue(prestacaoTotals.totalGlosado + prestacaoTotals.saldoNaoUtilizado),
      saldoGlobalDisponivel: formatCurrencyValue(prestacaoTotals.saldoGlobalDisponivel),
      percentualGlobalExecutado: formatPercentValue(prestacaoTotals.percentualExecutado),
      percentualGlobalComprovado: formatPercentValue(prestacaoTotals.percentualComprovado),
      totalItensPrestados: String(prestacaoTotals.totalPrestados),
      totalItensPendentes: String(prestacaoTotals.totalPendentes),
      totalItensGlosados: String(
        resolvedPrestacaoItems.filter((item) => parseCurrency(item.valorGlosadoItem) > 0).length,
      ),
      totalItensAprovados: String(
        resolvedPrestacaoItems.filter(
          (item) => parseCurrency(item.valorComprovadoItem) > 0 && item.statusItemPrestacao === 'Comprovado',
        ).length,
      ),
    },
  };

  function renderStep() {
    const stepKey = steps[activeStep]?.key ?? firstStep.key;

    switch (stepKey) {
      case 'dados-gerais':
        return <DadosGeraisStep data={syncCalculatedFields.dadosGerais} onChange={updateDadosGerais} />;
      case 'plano-trabalho':
        return (
          <PlanoTrabalhoStep
            data={formData.planoTrabalho}
            onItemsChange={(items) => {
              setFormData((current) => updatePlanoItems(current, items));
            }}
          />
        );
      case 'processo-contratacao':
        return (
          <ProcessoContratacaoStep
            draft={formData.processoContratacao}
            records={formData.processoContratacaoRegistros}
            onDraftChange={updateProcessoContratacao}
            onDraftReplace={replaceProcessoContratacaoDraft}
            onRecordsChange={updateProcessoContratacaoRegistros}
            onClearDraft={() => replaceProcessoContratacaoDraft(createProcessoContratacaoDraft())}
          />
        );
      case 'gestao-instrumento':
        return <GestaoInstrumentoStep data={formData.gestaoInstrumento} onChange={updateGestao} />;
      case 'ajuste-pt':
        return <AjustePtStep data={formData.ajustePt} onChange={updateAjustePt} />;
      case 'documentos':
        return <DocumentosStep data={formData.documentos} onChange={updateDocumentos} />;
      case 'filtros':
        return <FiltrosStep data={formData.filtros} onChange={updateFiltros} />;
      default:
        return null;
    }
  }

  const currentStep = steps[activeStep] ?? firstStep;

  return (
    <section className="view cadastro-view">
      <header className="page-head cadastro-hero">
        <div className="crumbs">
          <span className="crumb">Processos</span>
          <span className="crumb">Inventário de Instrumentos</span>
          <span className="crumb is-current">Novo Processo</span>
        </div>

        <div className="page-head__row">
          <div className="page-head__copy">
            <h2 className="cadastro-hero__title">Novo Processo</h2>
            <p>
              Registro institucional do instrumento com campos padronizados para identificação, vigência, repasses,
              contratação e acompanhamento no SIGINP.
            </p>
          </div>

        </div>
      </header>

      <div className="cadastro-stepper-shell">
        <CadastroStepper steps={steps} activeIndex={activeStep} onStepChange={setActiveStep} />
      </div>

      <div className="cadastro-scroll-area">
        <div className="cadastro-content cadastro-content--full">
          <section className="cadastro-panel">
            <div className="cadastro-panel__header">
              <div>
                <div className="section-kicker">
                  {currentStep.scope === 'inicial' ? 'Cadastro inicial' : currentStep.scope === 'governanca' ? 'Governança' : 'Módulo posterior'}
                </div>
                <h3>{currentStep.label}</h3>
              </div>
              <p>{currentStep.description}</p>
            </div>

            {renderStep()}
          </section>

          {false ? (
            <aside className="cadastro-sidebar">
              <article className="cadastro-sidebar__card cadastro-sidebar__card--dark">
                <div className="section-kicker section-kicker--inverse">Operação institucional</div>
                <strong>{validation.canSave ? 'Cadastro pronto para avançar' : 'Complete as pendências da etapa atual'}</strong>
                <p>
                  {currentStepMissingCount
                    ? `Faltam ${currentStepMissingCount} campo${currentStepMissingCount === 1 ? '' : 's'} essencial${currentStepMissingCount === 1 ? '' : 'is'} nesta etapa.`
                    : 'A leitura da etapa está consistente e pronta para continuidade.'}
                </p>
              </article>

              <article className="cadastro-sidebar__card cadastro-sidebar__card--soft">
                <div className="section-kicker">Encaminhamento</div>
                <strong>
                  {validation.firstIncompleteStep
                    ? 'Use o botão abaixo para ir direto à primeira pendência.'
                    : 'Siga para a próxima etapa quando concluir esta seção.'}
                </strong>
                <p>
                  O fluxo está organizado para reduzir retrabalho e manter a formalização em ordem.
                </p>
                {validation.firstIncompleteStep ? (
                  <button
                    type="button"
                    className="button button--secondary cadastro-sidebar__button"
                    onClick={() => {
                      const targetIndex = steps.findIndex((step) => step.key === validation.firstIncompleteStep);
                      if (targetIndex >= 0) setActiveStep(targetIndex);
                    }}
                  >
                    Ir para a primeira pendência
                  </button>
                ) : null}
              </article>
            </aside>
          ) : null}
        </div>

        <footer className="cadastro-footer">
          <button
            type="button"
            className="button button--secondary"
            onClick={() => setActiveStep((step) => Math.max(step - 1, 0))}
            disabled={activeStep === 0}
          >
            Etapa anterior
          </button>
          <div className="cadastro-footer__hint" role="status" aria-live="polite">
            <svg
              className="cadastro-footer__hint-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M12 3 1.6 20.5h20.8L12 3Zm0 4.1 6.9 11.6H5.1L12 7.1Zm0 3.1a1 1 0 0 0-1 1v3.7a1 1 0 0 0 2 0v-3.7a1 1 0 0 0-1-1Zm0 7a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z" />
            </svg>
            <span>Preencha os campos obrigatórios para avançar</span>
          </div>
          <button
            type="button"
            className="button button--primary"
            onClick={() => {
              if (activeStep === steps.length - 1) {
                if (validation.canSave) {
                  onSave(syncCalculatedFields);
                  return;
                }

                if (firstIncompleteStepIndex >= 0) {
                  setActiveStep(firstIncompleteStepIndex);
                }
                return;
              }

              setActiveStep((step) => Math.min(step + 1, steps.length - 1));
            }}
          >
            {activeStep === steps.length - 1 ? (validation.canSave ? 'Salvar instrumento' : 'Ir para pendências') : 'Próxima etapa'}
          </button>
        </footer>
      </div>
    </section>
  );
}

