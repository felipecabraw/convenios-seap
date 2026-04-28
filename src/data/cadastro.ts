export type CadastroStepKey =
  | 'dados-gerais'
  | 'plano-trabalho'
  | 'processo-contratacao'
  | 'gestao-instrumento'
  | 'ajuste-pt'
  | 'documentos'
  | 'filtros';

export type SelectOption = { value: string; label: string };
export type FieldKind = 'text' | 'textarea' | 'file' | 'date' | 'currency' | 'select' | 'calculated';
export type FieldSpan = 'full' | 'half' | 'third' | 'quarter';

export type CadastroStepDefinition = {
  key: CadastroStepKey;
  label: string;
  description: string;
  scope: 'inicial' | 'acompanhamento' | 'governanca';
};

export type CadastroFieldConfig<FieldKey extends string> = {
  key: FieldKey;
  label: string;
  kind: FieldKind;
  span?: FieldSpan;
  hint?: string;
  placeholder?: string;
  accept?: string;
  options?: readonly SelectOption[];
};

export type CadastroFieldGroup<FieldKey extends string> = {
  title: string;
  description: string;
  fields: CadastroFieldConfig<FieldKey>[];
};

export type DadosGeraisForm = {
  numeroInternoSeap: string;
  alertas: string;
  status: string;
  prazoFinalClausulaSuspensiva: string;
  dataFinalClausulaSuspensiva: string;
  diasRestanteClausulaSuspensiva: string;
  modalidade: string;
  normativo: string;
  eixo: string;
  setorCorrelacionado: string;
  instrumento: string;
  numeroInstrumento: string;
  anoFormalizacao: string;
  prazoValidade: string;
  vigenciaInicial: string;
  vigenciaFinal: string;
  diasRestantes: string;
  uploadTermo: string;
  repasseFinanceiro: string;
  prorrogacao: string;
  banco: string;
  contaBancaria: string;
  naturezaDespesa: string;
  valorGlobal: string;
  repasseParticipe: string;
  repasseSeap: string;
  situacaoRepasseSeap: string;
  saldoConta: string;
  dataAtualizacaoSaldoConta: string;
  saldoEconomicidade: string;
  rendimentoAplicacaoExistente: string;
  rendimentoAplicacaoAutorizado: string;
  recursoExecutado: string;
  percentualExecutado: string;
};

export type PlanoItemForm = {
  id: string;
  eixo?: string;
  penaJustaEixo?: string;
  penaJustaIndicadorUf?: string;
  planoEstrategicoObjetivo?: string;
  setorCorrelacionado?: string;
  categoriaItemObjeto: string;
  item: string;
  codigoNaturezaDespesa?: string;
  naturezaAquisicao?: string;
  quantidade: string;
  unidadeMedida: string;
  valorUnitarioAutorizado: string;
  valorTotalAutorizado: string;
  frutoDeAjuste: string;
  documentoAutorizacao: string;
  monitorado: string;
  statusItemPlano?: string;
  acaoAjuste?: string;
  saldoRendimento?: string;
};

export type PlanoObjetoForm = {
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

export type PlanoObjetoFormState = {
  draft: PlanoObjetoForm;
  editingItemId: string | null;
};

export type ProcessoContratacaoForm = {
  processoSei: string;
  statusProcesso: string;
  transferegovProcesso: string;
  neNumero: string;
  neData: string;
  neValor: string;
  neFonte: string;
  neSei: string;
  contratoNumero: string;
  contratoSei: string;
  transferegovContrato: string;
  valorUnitarioContratado: string;
  valorTotalContratado: string;
  quantidadeContratada: string;
  enteContratado: string;
  cnpjContratado: string;
  gestor: string;
  portariaGestorSei: string;
  fiscal: string;
  portariaFiscalSei: string;
  notaFiscalNumero: string;
  notaFiscalSei: string;
  informacaoGestorSei: string;
  termoRecebimentoProvisorioSei: string;
  termoRecebimentoDefinitivoSei: string;
  obNumero: string;
  obData: string;
  obValor: string;
  obFonte: string;
  obSei: string;
  tomboNumero: string;
  guiaTombamentoSei: string;
  fotoSei: string;
  transferegovEntrega: string;
  termoEntregaSei: string;
  relatorioBeneficiados: string;
  localizacao: string;
  unidadeBeneficiada: string;
  // Legacy aliases kept for compatibility while the module migrates to the new naming scheme.
  statusItem?: string;
  abaTransferegovProcesso?: string;
  abaTransferegovContrato?: string;
  abaTransferegovEntrega?: string;
  gestorPortariaSei?: string;
  fiscalPortariaSei?: string;
};

export type ProcessoContratacaoRegistro = ProcessoContratacaoForm & {
  id: string;
  itensVinculados?: ContratacaoItemVinculado[];
};

export type ProcessoContratacaoRegistroFormState = {
  draft: ProcessoContratacaoForm;
  editingRecordId: string | null;
};

export type ContratacaoItemVinculado = {
  id: string;
  planoItemId: string;
  itemDescricao: string;
  quantidadeContratada: string;
  valorUnitarioContratado: string;
  valorTotalContratado: string;
};

export type GestaoInstrumentoForm = {
  publicacaoInstitucional: string;
  fiscalInstrumento: string;
  portariaFiscalSei: string;
  substatus: string;
  oficioSei: string;
  prorrogacaoStatus: string;
  prorrogacaoSolicitacaoSei: string;
  prorrogacaoAutorizacaoSei: string;
  prorrogacaoNovoPeriodo: string;
  prorrogacaoTermoAditivo: string;
  ajustePlanoStatus: string;
  ajustePlanoSolicitacaoSei: string;
  ajustePlanoAutorizacaoSei: string;
  ajustePlanoDocumentoAutorizador: string;
  ajustePlanoHistorico: string;
  saldoRendimentoStatus: string;
  saldoRendimentoSolicitacaoSei: string;
  saldoRendimentoAutorizacaoSei: string;
  saldoRendimentoDocumentoAutorizador: string;
  saldoRendimentoValorAutorizado: string;
  suplementacaoStatus: string;
  suplementacaoSolicitacaoSei: string;
  suplementacaoAutorizacaoSei: string;
  suplementacaoDocumentoAutorizador: string;
  suplementacaoValorAutorizado: string;
  prestacaoGestaoStatus: string;
  prestacaoGestaoEspecie: string;
  prestacaoGestaoPeriodo: string;
  prestacaoGestaoPeriodoInicio: string;
  prestacaoGestaoPeriodoFim: string;
  prestacaoGestaoRelatorioSei: string;
  prestacaoGestaoUploadRelatorio: string;
  prestacaoGestaoDocumentoEnvioSei: string;
  prestacaoGestaoAnalise: string;
  prestacaoGestaoAnaliseAreaTecnica: string;
  prestacaoGestaoAnaliseDocumentoSei: string;
  prestacaoGestaoAnaliseStatus: string;
  prestacaoGestaoComplementacaoStatus: string;
  prestacaoGestaoComplementacaoDocumentoRespostaSei: string;
  prestacaoGestaoComplementacaoDocumentoAnaliseSei: string;
};

export type AjustePtForm = {
  status: string;
  documentoSolicitacaoSei: string;
  documentoAutorizacaoSei: string;
  uploadDocumentoAutorizador: string;
  historicoMudancas: string;
  impactoFinanceiro: string;
  observacoes: string;
};

export type DocumentoForm = {
  termoAdesao: string;
  termoConvenio: string;
  planoAcao: string;
  espelhoEmendaParlamentar: string;
  decisaoPenaPecuniaria: string;
  termoColaboracao: string;
  termoFomento: string;
  acordoCooperacaoTecnica: string;
  termoAditivo: string;
  relatorios: string;
  documentoAutorizador: string;
};

export type FiltrosForm = {
  politicaSegmentoEixo: string;
  setorCorrelacionado: string;
  anoFormalizacao: string;
  anoExecucao: string;
  instrumento: string;
  localBeneficiado: string;
  objeto: string;
};

export type PrestacaoItemForm = {
  itemPlanoId: string;
  itemPlanoDescricao: string;
  categoriaItemObjeto: string;
  quantidadePrevista: string;
  quantidadeExecutada: string;
  valorUnitarioPrevisto: string;
  valorTotalPrevisto: string;
  valorExecutadoItem: string;
  valorComprovadoItem: string;
  valorGlosadoItem: string;
  saldoNaoUtilizadoItem: string;
  statusItemPrestacao: string;
  observacaoItem: string;
  documentosItem: string;
  notaFiscalItem: string;
  reciboItem: string;
  ordemBancariaItem: string;
  extratoItem: string;
  relatorioExecucaoItem: string;
  fotoOuEvidenciaItem: string;
  termoRecebimentoItem: string;
  parecerItem: string;
  pendenciaDocumentalItem: string;
};

export type PrestacaoContasForm = {
  statusPrestacaoGlobal: string;
  tipoPrestacao: string;
  periodoReferenciaInicio: string;
  periodoReferenciaFim: string;
  dataProtocolo: string;
  dataAnalise: string;
  dataConclusao: string;
  responsavelPrestacao: string;
  setorResponsavel: string;
  statusAnaliseGlobal: string;
  valorGlobalAprovado: string;
  valorGlobalExecutado: string;
  valorGlobalComprovado: string;
  valorGlobalGlosado: string;
  valorGlobalADevolver: string;
  saldoGlobalDisponivel: string;
  percentualGlobalExecutado: string;
  percentualGlobalComprovado: string;
  totalItensPrestados: string;
  totalItensPendentes: string;
  totalItensGlosados: string;
  totalItensAprovados: string;
  resultadoFinalGlobal: string;
  motivoGlosaGlobal: string;
  valorDevolucaoGlobal: string;
  dataDevolucaoGlobal: string;
  contaEncerrada: string;
  observacoesFinais: string;
  itens: PrestacaoItemForm[];
};

export type CadastroInstrumentoFormData = {
  dadosGerais: DadosGeraisForm;
  planoTrabalho: { itens: PlanoItemForm[] };
  processoContratacao: ProcessoContratacaoForm;
  processoContratacaoRegistros: ProcessoContratacaoRegistro[];
  gestaoInstrumento: GestaoInstrumentoForm;
  ajustePt: AjustePtForm;
  documentos: DocumentoForm;
  filtros: FiltrosForm;
  prestacaoContas: PrestacaoContasForm;
};

export type InstrumentoProcesso = CadastroInstrumentoFormData;
export type PlanoAcaoItem = PlanoItemForm;
export type ContratacaoRegistro = ProcessoContratacaoRegistro;
export type AjustePlanoRegistro = AjustePtForm & { id: string };
export type PrestacaoRegistro = PrestacaoContasForm & { id: string };
export type DocumentoRegistro = {
  id: string;
  origem: 'instrumento' | 'item-plano' | 'contratacao' | 'ajuste' | 'prestacao' | 'gestao';
  titulo: string;
  referenciaSei: string;
  arquivo: string;
};

export type CadastroValidationStep = {
  key: CadastroStepKey;
  label: string;
  missing: string[];
};

export type CadastroValidationSummary = {
  steps: CadastroValidationStep[];
  missingByStep: Record<CadastroStepKey, string[]>;
  totalMissing: number;
  firstIncompleteStep: CadastroStepKey | null;
  canSave: boolean;
};

function createOptions(values: readonly string[]): SelectOption[] {
  return values.map((value) => ({ value, label: value }));
}

export const cadastroOptionSets = {
  alertas: createOptions(['Sem alteração', 'Solicitar prorrogação', 'Prestar contas', 'Pendência documental', 'Prazo crítico']),
  status: createOptions([
    'Em formalização',
    'Vigente',
    'Cláusula Suspensiva',
    'Em prorrogação',
    'Em ajuste de PT',
    'Em solicitação de saldo de rendimento',
    'Em suplementação',
    'Em prestação de contas',
    'Em execução',
    'Concluído',
  ]),
  modalidade: createOptions(['Discricionária', 'Obrigatória']),
  eixo: createOptions([
    'Saúde e qualidade de vida do servidor',
    'Aparelhamento do SISPERN',
    'Sistema de monitoramento',
    'Assistência material PPL',
    'Assistência à saúde PPL',
    'Assistência social PPL',
    'Assistência jurídica PPL',
    'Assistência religiosa PPL',
    'Assistência de educação PPL',
    'Política de atenção ao egresso',
    'Política de alternativas penais',
    'Política de trabalho prisional',
    'Política de engenharia e arquitetura prisional',
    'Política de atenção às mulheres presas e grupos específicos',
    'Capacitação do servidor',
    'Programas de melhorias e modernização do sistema penitenciário nacional',
    'Regulação de vagas',
  ]),
  instrumento: createOptions([
    'Fundo a Fundo obrigatório',
    'Fundo a Fundo voluntário',
    'Plano de Trabalho',
    'Convênio',
    'Emenda Parlamentar Estadual',
    'Emenda Parlamentar Federal',
    'Penas Pecuniárias',
    'Termo de Colaboração',
    'Termo de Fomento',
    'Acordo de Cooperação Técnica',
    'Parceria com entidade privada',
  ]),
  normativo: createOptions([
    'Lei Complementar nº 793/2025',
    'Lei Complementar nº 79/1994',
    'Portaria ministerial',
    'Termo específico do instrumento',
    'Outro normativo',
  ]),
  prorrogacao: createOptions(['Vigente', 'Em análise', 'Solicitar prorrogação', 'Prorrogação solicitada', 'Vigente - Prorrogado']),
  banco: createOptions(['Brasil', 'Caixa Econômica Federal', 'Banco do Nordeste', 'Outro']),
  naturezaDespesa: createOptions(['Custeio', 'Capital', 'Obra']),
  situacaoRepasseSeap: createOptions(['Solicitado', 'Em análise', 'Integralizado', 'Aplicado em conta poupança', 'Pendente']),
  frutoDeAjuste: createOptions(['Sim', 'Não']),
  monitorado: createOptions(['Sim', 'Não']),
  simNao: createOptions(['Sim', 'Não']),
  unidadesSistema: createOptions([
    'Cadeia Pública de Caraúbas',
    'CDP PARNAMIRIM FEM - Centro de Detenção Provisória Parnamirim Feminino',
    'CPDS - Cadeia Pública de Ceará-Mirim',
    'CPEAMN FEM - Complexo Penal Estadual Agrícola Mário Negócio Feminino',
    'CPEAMN MASC - Complexo Penal Estadual Agrícola Mário Negócio Masculino',
    'CPJC FEM - Complexo Penal João Chaves Feminino',
    'CPM - Cadeia Pública de Mossoró',
    'CPN - Cadeia Pública de Natal',
    'CPNC - Cadeia Pública de Nova Cruz',
    'CPRPF - Centro Penal Dr. Francisco Nogueira Fernandes',
    'CRT - Centro de Recebimento e Triagem',
    'DPC - Departamento de Promoção à Cidadania',
    'PEA - Penitenciária Estadual de Alcaçuz',
    'PEP - Penitenciária Estadual de Parnamirim',
    'PERCM - Penitenciária Estadual Rogério Coutinho Madruga',
    'PRESÉPIO - Unidade do Presépio',
    'SEAP - Secretaria de Estado da Administração Penitenciária',
    'SEAP/GSI - Gabinete de Segurança Institucional',
    'UIAG - Unidade Instrumental de Administração Geral',
    'UPCT - Unidade Prisional em prédio onde hoje funciona a UPCT',
    'DGCP - Departamento de Gestão de Convênios e Projetos',
  ]),
  categoriaItemObjeto: createOptions(['Bem', 'Serviço', 'Obra', 'Infraestrutura', 'Tecnologia', 'Capacitação', 'Projeto']),
  naturezaAquisicao: createOptions(['Recurso do instrumento', 'Contrapartida', 'Rendimento autorizado', 'Suplementação']),
  statusItem: createOptions(['Não iniciada', 'Em execução', 'Parada', 'Recebido/Fornecido', 'Em fornecimento', 'Solicitar ajuste']),
  acaoAjuste: createOptions(['Manter', 'Incluir', 'Excluir', 'Alterar quantidade', 'Alterar valor']),
  statusProcesso: createOptions(['Em andamento', 'Parado', 'Concluído', 'Arquivado']),
  substatus: createOptions([
    'Sem alterações',
    'Acompanhamento regular',
    'Cláusula suspensiva ativa',
    'Em prorrogação',
    'Em suplementação',
    'Em ajuste de PT',
    'Em prestação de contas anual',
    'Em prestação de contas final',
  ]),
  publicacaoInstitucional: createOptions(['Solicitada', 'Publicada', 'Pendente', 'Não se aplica']),
  fluxoStatus: createOptions(['Não iniciado', 'Solicitado', 'Em análise', 'Autorizado', 'Indeferido', 'Concluído']),
  statusAnaliseGestao: createOptions(['Em conformidade', 'Em desconformidade']),
  statusComplementacaoAnalise: createOptions(['Em análise', 'Enviado', 'Resolvido']),
  tipoPrestacao: createOptions(['Parcial', 'Anual', 'Final', 'Complementar']),
  especiePrestacao: createOptions(['Anual', 'Final', 'Parcial', 'Complementar']),
  statusPrestacaoGlobal: createOptions(['Não iniciada', 'Em elaboração', 'Enviada', 'Em análise', 'Concluída']),
  statusAnaliseGlobal: createOptions([
    'Em elaboração',
    'Enviada',
    'Em análise',
    'Com pendência',
    'Aprovada',
    'Aprovada com ressalvas',
    'Reprovada',
  ]),
  statusItemPrestacao: createOptions(['Não iniciado', 'Em execução', 'Comprovado', 'Pendente', 'Glosado', 'Encerrado']),
  resultadoFinalGlobal: createOptions(['Aguardando conclusão', 'Aprovada', 'Aprovada com ressalvas', 'Reprovada']),
} as const;

export const cadastroSteps: CadastroStepDefinition[] = [
  { key: 'dados-gerais', label: 'Dados Gerais', description: 'Informações básicas do processo.', scope: 'inicial' },
  { key: 'plano-trabalho', label: 'Plano de Trabalho', description: 'Objetivos, metas e atividades.', scope: 'inicial' },
  { key: 'documentos', label: 'Documentos', description: 'Anexos obrigatórios.', scope: 'inicial' },
  { key: 'filtros', label: 'Filtros', description: 'Regras e configurações.', scope: 'inicial' },
];

export function createPlanoItem(): PlanoItemForm {
  return {
    id: 'item-1',
    eixo: '',
    penaJustaEixo: '',
    penaJustaIndicadorUf: '',
    planoEstrategicoObjetivo: '',
    setorCorrelacionado: '',
    categoriaItemObjeto: '',
    item: '',
    codigoNaturezaDespesa: '',
    naturezaAquisicao: 'Recurso do instrumento',
    quantidade: '',
    unidadeMedida: '',
    valorUnitarioAutorizado: '',
    valorTotalAutorizado: '',
    frutoDeAjuste: 'Não',
    documentoAutorizacao: '',
    monitorado: 'Sim',
    statusItemPlano: 'Não iniciada',
    acaoAjuste: 'Manter',
    saldoRendimento: '',
  };
}

export function calculatePlanoItemTotal(quantidade: string, valorUnitario: string) {
  const parsedQuantidade = Number(String(quantidade).replace(',', '.').replace(/[^\d.-]/g, ''));
  const parsedUnitario = Number(String(valorUnitario).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
  const quantidadeValida = Number.isFinite(parsedQuantidade) ? parsedQuantidade : 0;
  const unitarioValido = Number.isFinite(parsedUnitario) ? parsedUnitario : 0;
  const total = quantidadeValida * unitarioValido;

  if (!Number.isFinite(total) || total <= 0) return '';

  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total);
}


export function calculateProcessoContratacaoTotal(quantidade: string, valorUnitario: string) {
  const parsedQuantidade = Number(String(quantidade).replace(',', '.').replace(/[^\d.-]/g, ''));
  const parsedUnitario = Number(String(valorUnitario).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
  const total = (Number.isFinite(parsedQuantidade) ? parsedQuantidade : 0) * (Number.isFinite(parsedUnitario) ? parsedUnitario : 0);

  if (!Number.isFinite(total) || total <= 0) return '';

  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total);
}

export function createProcessoContratacaoDraft(): ProcessoContratacaoForm {
  return {
    processoSei: '',
    statusProcesso: 'Em instrução',
    transferegovProcesso: 'Não',
    neNumero: '',
    neData: '',
    neValor: '',
    neFonte: '',
    neSei: '',
    contratoNumero: '',
    contratoSei: '',
    transferegovContrato: 'Não',
    valorUnitarioContratado: '',
    valorTotalContratado: '',
    quantidadeContratada: '',
    enteContratado: '',
    cnpjContratado: '',
    gestor: '',
    portariaGestorSei: '',
    fiscal: '',
    portariaFiscalSei: '',
    notaFiscalNumero: '',
    notaFiscalSei: '',
    informacaoGestorSei: '',
    termoRecebimentoProvisorioSei: '',
    termoRecebimentoDefinitivoSei: '',
    obNumero: '',
    obData: '',
    obValor: '',
    obFonte: '',
    obSei: '',
    tomboNumero: '',
    guiaTombamentoSei: '',
    fotoSei: '',
    transferegovEntrega: 'Não',
    termoEntregaSei: '',
    relatorioBeneficiados: '',
    localizacao: '',
    unidadeBeneficiada: '',
  };
}

export function sumProcessoContratacaoTotalContratado(records: ProcessoContratacaoRegistro[]) {
  return records.reduce((sum, record) => {
    const parsed = Number(String(record.valorTotalContratado).replace(/\\./g, '').replace(',', '.').replace(/[^\\d.-]/g, ''));
    return sum + (Number.isFinite(parsed) ? parsed : 0);
  }, 0);
}

export function sumProcessoContratacaoTotalPago(records: ProcessoContratacaoRegistro[]) {
  return records.reduce((sum, record) => {
    const parsed = Number(String(record.obValor).replace(/\\./g, '').replace(',', '.').replace(/[^\\d.-]/g, ''));
    return sum + (Number.isFinite(parsed) ? parsed : 0);
  }, 0);
}

export function createPrestacaoItemFromPlanoItem(item: PlanoItemForm): PrestacaoItemForm {
  return {
    itemPlanoId: item.id,
    itemPlanoDescricao: item.item,
    categoriaItemObjeto: item.categoriaItemObjeto,
    quantidadePrevista: item.quantidade,
    quantidadeExecutada: '',
    valorUnitarioPrevisto: item.valorUnitarioAutorizado,
    valorTotalPrevisto: item.valorTotalAutorizado,
    valorExecutadoItem: '',
    valorComprovadoItem: '',
    valorGlosadoItem: '',
    saldoNaoUtilizadoItem: '',
    statusItemPrestacao: 'Não iniciado',
    observacaoItem: '',
    documentosItem: '',
    notaFiscalItem: '',
    reciboItem: '',
    ordemBancariaItem: '',
    extratoItem: '',
    relatorioExecucaoItem: '',
    fotoOuEvidenciaItem: '',
    termoRecebimentoItem: '',
    parecerItem: '',
    pendenciaDocumentalItem: '',
  };
}

export const dadosGeraisFieldGroups: CadastroFieldGroup<keyof DadosGeraisForm>[] = [
  {
    title: 'Base cadastral',
    description: 'Identificação, enquadramento normativo, vigência e alertas do instrumento.',
    fields: [
      { key: 'numeroInternoSeap', label: 'Nº Interno SEAP', kind: 'text' },
      { key: 'alertas', label: 'Alertas', kind: 'select', options: cadastroOptionSets.alertas },
      { key: 'status', label: 'Status', kind: 'select', options: cadastroOptionSets.status },
      { key: 'modalidade', label: 'Modalidade', kind: 'select', options: cadastroOptionSets.modalidade },
      { key: 'normativo', label: 'Normativo', kind: 'textarea', placeholder: 'Ex.: Lei Complementar nº 793/2025, Portaria ministerial, termo específico...', span: 'full' },
      { key: 'instrumento', label: 'Instrumento', kind: 'select', options: cadastroOptionSets.instrumento },
      { key: 'numeroInstrumento', label: 'Nº', kind: 'text' },
      { key: 'anoFormalizacao', label: 'Ano de formalização', kind: 'text' },
      { key: 'prazoValidade', label: 'Prazo de validade', kind: 'date' },
      { key: 'eixo', label: 'Eixo', kind: 'select', options: cadastroOptionSets.eixo, span: 'full' },
      { key: 'setorCorrelacionado', label: 'Setor correlacionado', kind: 'select', options: cadastroOptionSets.unidadesSistema },
      {
        key: 'uploadTermo',
        label: 'Upload de termo / referência SEI',
        kind: 'file',
        hint: 'Anexe o termo inicial do processo. PDF, DOC ou imagem.',
        accept: '.pdf,.doc,.docx,.png,.jpg,.jpeg',
        span: 'full',
      },
      { key: 'repasseFinanceiro', label: 'Repasse financeiro?', kind: 'select', options: cadastroOptionSets.simNao },
    ],
  },
  {
    title: 'Prazos e cláusula suspensiva',
    description: 'Controle temporal usado para alertas automáticos e priorização de risco.',
    fields: [
      { key: 'prazoFinalClausulaSuspensiva', label: 'Prazo final da Cláusula Suspensiva', kind: 'date' },
      { key: 'dataFinalClausulaSuspensiva', label: 'Data final da Cláusula Suspensiva', kind: 'date' },
      { key: 'diasRestanteClausulaSuspensiva', label: 'Dias restantes da Cláusula Suspensiva', kind: 'calculated', hint: 'Campo calculado' },
      { key: 'vigenciaInicial', label: 'Vigência Inicial', kind: 'date' },
      { key: 'vigenciaFinal', label: 'Vigência Final', kind: 'date' },
      { key: 'diasRestantes', label: 'Dias restantes', kind: 'calculated', hint: 'Campo calculado' },
      { key: 'prorrogacao', label: 'Prorrogação', kind: 'select', options: cadastroOptionSets.prorrogacao },
    ],
  },
  {
    title: 'Financeiro e repasses',
    description: 'Dados bancários, saldos e indicadores automáticos do instrumento.',
    fields: [
      { key: 'banco', label: 'Banco', kind: 'select', options: cadastroOptionSets.banco },
      { key: 'contaBancaria', label: 'Conta bancária', kind: 'text' },
      { key: 'naturezaDespesa', label: 'Natureza de despesa', kind: 'select', options: cadastroOptionSets.naturezaDespesa },
      { key: 'valorGlobal', label: 'Valor Global', kind: 'currency' },
      { key: 'repasseParticipe', label: 'Repasse Partícipe', kind: 'currency' },
      { key: 'repasseSeap', label: 'Repasse SEAP', kind: 'currency' },
      { key: 'situacaoRepasseSeap', label: 'Situação do Repasse SEAP', kind: 'select', options: cadastroOptionSets.situacaoRepasseSeap },
      { key: 'saldoConta', label: 'Saldo em conta', kind: 'currency' },
      { key: 'dataAtualizacaoSaldoConta', label: 'Data de atualização do saldo', kind: 'date' },
      { key: 'saldoEconomicidade', label: 'Saldo de Economicidade', kind: 'calculated', hint: 'Valor autorizado - valor contratado' },
      { key: 'rendimentoAplicacaoExistente', label: 'Rendimento de Aplicação Existente', kind: 'calculated' },
      { key: 'rendimentoAplicacaoAutorizado', label: 'Rendimento de Aplicação Autorizado', kind: 'currency' },
      { key: 'recursoExecutado', label: 'Recurso Executado', kind: 'currency' },
      { key: 'percentualExecutado', label: '% Executado', kind: 'calculated', hint: 'Campo calculado' },
    ],
  },
];

export const processoContratacaoFieldGroups: CadastroFieldGroup<string>[] = [
  {
    title: 'Processo, NE e contrato',
    description: 'Primeira camada operacional do processo de contratação.',
    fields: [
      { key: 'statusItem', label: 'Status de item', kind: 'select', options: cadastroOptionSets.statusItem },
      { key: 'processoSei', label: 'Processo SEI nº', kind: 'text' },
      { key: 'statusProcesso', label: 'Status de processo', kind: 'select', options: cadastroOptionSets.statusProcesso },
      { key: 'abaTransferegovProcesso', label: 'Aba Transferegov? Processo', kind: 'select', options: cadastroOptionSets.simNao },
      { key: 'neNumero', label: 'NE nº', kind: 'text' },
      { key: 'neData', label: 'NE Data', kind: 'date' },
      { key: 'neValor', label: 'NE Valor', kind: 'currency' },
      { key: 'neFonte', label: 'NE Fonte', kind: 'text' },
      { key: 'neSei', label: 'NE SEI nº', kind: 'text' },
      { key: 'contratoNumero', label: 'Contrato nº', kind: 'text' },
      { key: 'contratoSei', label: 'Contrato SEI nº', kind: 'text' },
      { key: 'abaTransferegovContrato', label: 'Aba Transferegov? Contrato', kind: 'select', options: cadastroOptionSets.simNao },
      { key: 'valorUnitarioContratado', label: 'Valor Unitário Contratado', kind: 'currency' },
      { key: 'valorTotalContratado', label: 'Valor Total Contratado', kind: 'currency' },
      { key: 'quantidadeContratada', label: 'Quantidade Contratada', kind: 'text' },
      { key: 'enteContratado', label: 'Ente Contratado', kind: 'text', span: 'full' },
      { key: 'cnpjContratado', label: 'CNPJ do Contratado', kind: 'text' },
    ],
  },
  {
    title: 'Gestão, fiscalização e notas',
    description: 'Governança do contrato, notas fiscais e recebimento.',
    fields: [
      { key: 'gestor', label: 'Gestor', kind: 'text' },
      { key: 'gestorPortariaSei', label: 'Portaria SEI nº (Gestor)', kind: 'text' },
      { key: 'fiscal', label: 'Fiscal', kind: 'text' },
      { key: 'fiscalPortariaSei', label: 'Portaria SEI nº (Fiscal)', kind: 'text' },
      { key: 'notaFiscalNumero', label: 'Nota Fiscal nº', kind: 'text' },
      { key: 'notaFiscalSei', label: 'Nota Fiscal SEI nº', kind: 'text' },
      { key: 'informacaoGestorSei', label: 'Informação do Gestor SEI nº', kind: 'text', span: 'full' },
      { key: 'termoRecebimentoProvisorioSei', label: 'Termo de Recebimento Provisório SEI nº', kind: 'text', span: 'full' },
      { key: 'termoRecebimentoDefinitivoSei', label: 'Termo de Recebimento Definitivo SEI nº', kind: 'text', span: 'full' },
    ],
  },
  {
    title: 'Ordem bancária, tombamento e entrega',
    description: 'Liquidação, patrimônio, entrega, beneficiários e localização.',
    fields: [
      { key: 'obNumero', label: 'OB nº', kind: 'text' },
      { key: 'obData', label: 'OB Data', kind: 'date' },
      { key: 'obValor', label: 'OB Valor', kind: 'currency' },
      { key: 'obFonte', label: 'OB Fonte', kind: 'text' },
      { key: 'obSei', label: 'OB SEI nº', kind: 'text' },
      { key: 'tomboNumero', label: 'Tombo nº', kind: 'text' },
      { key: 'guiaTombamentoSei', label: 'Guia de Tombamento SEI nº', kind: 'text' },
      { key: 'fotoSei', label: 'Foto no SEI nº', kind: 'text' },
      { key: 'abaTransferegovEntrega', label: 'Aba Transferegov? Entrega', kind: 'select', options: cadastroOptionSets.simNao },
      { key: 'termoEntregaSei', label: 'Termo de Entrega SEI nº', kind: 'text' },
      { key: 'relatorioBeneficiados', label: 'Relatório de beneficiados', kind: 'select', options: cadastroOptionSets.unidadesSistema, span: 'full' },
      { key: 'localizacao', label: 'Localização', kind: 'select', options: cadastroOptionSets.unidadesSistema },
      { key: 'unidadeBeneficiada', label: 'Unidade Beneficiada', kind: 'select', options: cadastroOptionSets.unidadesSistema },
    ],
  },
];

export const gestaoInstrumentoFieldGroups: CadastroFieldGroup<keyof GestaoInstrumentoForm>[] = [
  {
    title: 'Governança institucional',
    description: 'Publicação, fiscal do instrumento e substatus principal.',
    fields: [
      { key: 'publicacaoInstitucional', label: 'Publicação no DOE, site e PNCP', kind: 'select', options: cadastroOptionSets.publicacaoInstitucional },
      { key: 'fiscalInstrumento', label: 'Fiscal do Instrumento', kind: 'text' },
      { key: 'portariaFiscalSei', label: 'Portaria SEI nº', kind: 'text' },
      { key: 'substatus', label: 'Substatus', kind: 'select', options: cadastroOptionSets.substatus },
      { key: 'oficioSei', label: 'Ofício SEI nº', kind: 'text' },
    ],
  },
  {
    title: 'Prorrogação',
    description: 'Solicitação, autorização, novo período e termo aditivo.',
    fields: [
      { key: 'prorrogacaoStatus', label: 'Status', kind: 'select', options: cadastroOptionSets.fluxoStatus },
      { key: 'prorrogacaoSolicitacaoSei', label: 'Documento de solicitação SEI nº', kind: 'text' },
      { key: 'prorrogacaoAutorizacaoSei', label: 'Documento de autorização SEI nº', kind: 'text' },
      { key: 'prorrogacaoNovoPeriodo', label: 'Novo período autorizado', kind: 'text' },
      {
        key: 'prorrogacaoTermoAditivo',
        label: 'Upload / SEI do termo aditivo',
        kind: 'file',
        accept: '.pdf,.doc,.docx,.png,.jpg,.jpeg',
        span: 'full',
      },
    ],
  },
  {
    title: 'Saldo de rendimento e suplementação',
    description: 'Autorização e valores de reforço financeiro.',
    fields: [
      { key: 'saldoRendimentoStatus', label: 'Status do saldo de rendimento', kind: 'select', options: cadastroOptionSets.fluxoStatus },
      { key: 'saldoRendimentoSolicitacaoSei', label: 'Solicitação SEI nº', kind: 'text' },
      { key: 'saldoRendimentoAutorizacaoSei', label: 'Autorização SEI nº', kind: 'text' },
      { key: 'saldoRendimentoDocumentoAutorizador', label: 'Documento autorizador', kind: 'text' },
      { key: 'saldoRendimentoValorAutorizado', label: 'Valor autorizado', kind: 'currency' },
      { key: 'suplementacaoStatus', label: 'Status da suplementação', kind: 'select', options: cadastroOptionSets.fluxoStatus },
      { key: 'suplementacaoSolicitacaoSei', label: 'Solicitação SEI nº', kind: 'text' },
      { key: 'suplementacaoAutorizacaoSei', label: 'Autorização SEI nº', kind: 'text' },
      { key: 'suplementacaoDocumentoAutorizador', label: 'Documento autorizador', kind: 'text' },
      { key: 'suplementacaoValorAutorizado', label: 'Valor autorizado', kind: 'currency' },
    ],
  },
  {
    title: 'Prestação de contas na gestão',
    description: 'Status, espécie, período, relatório e análise do envio.',
    fields: [
      { key: 'prestacaoGestaoStatus', label: 'Status', kind: 'select', options: cadastroOptionSets.fluxoStatus },
      { key: 'prestacaoGestaoEspecie', label: 'Espécie', kind: 'select', options: cadastroOptionSets.especiePrestacao },
      { key: 'prestacaoGestaoPeriodoInicio', label: 'Data inicial do período', kind: 'date' },
      { key: 'prestacaoGestaoPeriodoFim', label: 'Data final do período', kind: 'date' },
      { key: 'prestacaoGestaoRelatorioSei', label: 'Relatório SEI nº', kind: 'text' },
      {
        key: 'prestacaoGestaoUploadRelatorio',
        label: 'Upload do relatório',
        kind: 'file',
        accept: '.pdf,.doc,.docx,.png,.jpg,.jpeg',
      },
      { key: 'prestacaoGestaoDocumentoEnvioSei', label: 'Documento de envio SEI nº', kind: 'text' },
    ],
  },
  {
    title: 'Análise',
    description: 'Registro da área técnica, resultado da análise e eventual complementação documental.',
    fields: [
      { key: 'prestacaoGestaoAnaliseAreaTecnica', label: 'Área técnica', kind: 'text' },
      { key: 'prestacaoGestaoAnaliseDocumentoSei', label: 'Documento de análise SEI nº', kind: 'text' },
      {
        key: 'prestacaoGestaoAnaliseStatus',
        label: 'Status da análise',
        kind: 'select',
        options: cadastroOptionSets.statusAnaliseGestao,
      },
      {
        key: 'prestacaoGestaoComplementacaoStatus',
        label: 'Status da complementação',
        kind: 'select',
        options: cadastroOptionSets.statusComplementacaoAnalise,
      },
      {
        key: 'prestacaoGestaoComplementacaoDocumentoRespostaSei',
        label: 'Documento resposta SEI nº',
        kind: 'text',
      },
      {
        key: 'prestacaoGestaoComplementacaoDocumentoAnaliseSei',
        label: 'Documento de análise SEI nº',
        kind: 'text',
      },
    ],
  },
];

export const ajustePtFieldGroups: CadastroFieldGroup<keyof AjustePtForm>[] = [
  {
    title: 'Ajuste do Plano',
    description: 'Fluxo de formalização do ajuste e trilha de decisão.',
    fields: [
      { key: 'status', label: 'Status', kind: 'select', options: cadastroOptionSets.fluxoStatus },
      { key: 'documentoSolicitacaoSei', label: 'Documento de solicitação SEI nº', kind: 'text' },
      { key: 'documentoAutorizacaoSei', label: 'Documento de autorização SEI nº', kind: 'text' },
      { key: 'uploadDocumentoAutorizador', label: 'Upload / SEI do documento autorizador', kind: 'text' },
      { key: 'impactoFinanceiro', label: 'Impacto financeiro', kind: 'currency' },
      { key: 'historicoMudancas', label: 'Histórico das mudanças', kind: 'text', span: 'full' },
      { key: 'observacoes', label: 'Observações', kind: 'text', span: 'full' },
    ],
  },
];

export const documentosFieldGroups: CadastroFieldGroup<keyof DocumentoForm>[] = [
  {
    title: 'Repositório de documentos',
    description: 'Referências SEI, links ou identificadores dos arquivos obrigatórios.',
    fields: [
      { key: 'termoAdesao', label: 'Termo de adesão', kind: 'text' },
      { key: 'termoConvenio', label: 'Termo de convênio', kind: 'text' },
      { key: 'planoAcao', label: 'Plano de ação', kind: 'text' },
      { key: 'espelhoEmendaParlamentar', label: 'Espelho da emenda parlamentar', kind: 'text' },
      { key: 'decisaoPenaPecuniaria', label: 'Decisão de pena pecuniária', kind: 'text' },
      { key: 'termoColaboracao', label: 'Termo de colaboração', kind: 'text' },
      { key: 'termoFomento', label: 'Termo de fomento', kind: 'text' },
      { key: 'acordoCooperacaoTecnica', label: 'Acordo de cooperação técnica', kind: 'text' },
      { key: 'termoAditivo', label: 'Termo aditivo', kind: 'text' },
      { key: 'relatorios', label: 'Relatórios', kind: 'text', span: 'full' },
      { key: 'documentoAutorizador', label: 'Documento autorizador', kind: 'text', span: 'full' },
    ],
  },
];

export const filtrosFieldGroups: CadastroFieldGroup<keyof FiltrosForm>[] = [
  {
    title: 'Filtros gerenciais',
    description: 'Metadados que alimentam pesquisas, segmentações e relatórios.',
    fields: [
      { key: 'politicaSegmentoEixo', label: 'Política / Segmento / Eixo', kind: 'select', options: cadastroOptionSets.eixo, span: 'full' },
      { key: 'setorCorrelacionado', label: 'Setor correlacionado', kind: 'text' },
      { key: 'anoFormalizacao', label: 'Ano de formalização', kind: 'text' },
      { key: 'anoExecucao', label: 'Ano execução', kind: 'text' },
      { key: 'instrumento', label: 'Instrumento', kind: 'select', options: cadastroOptionSets.instrumento },
      { key: 'localBeneficiado', label: 'Local beneficiado', kind: 'text' },
      { key: 'objeto', label: 'Objeto', kind: 'text', span: 'full' },
    ],
  },
];

export const cadastroInitialFormData: CadastroInstrumentoFormData = {
  dadosGerais: {
    numeroInternoSeap: '2026.0001/SEAP',
    alertas: 'Sem alteração',
    status: 'Em formalização',
    prazoFinalClausulaSuspensiva: '',
    dataFinalClausulaSuspensiva: '',
    diasRestanteClausulaSuspensiva: '',
    modalidade: 'Discricionária',
    normativo: 'Lei Complementar nº 793/2025',
    eixo: 'Saúde e qualidade de vida do servidor',
    setorCorrelacionado: '',
    instrumento: 'Convênio',
    numeroInstrumento: '',
    anoFormalizacao: '',
    prazoValidade: '',
    vigenciaInicial: '',
    vigenciaFinal: '',
    diasRestantes: '',
    uploadTermo: '',
    repasseFinanceiro: 'Sim',
    prorrogacao: 'Vigente',
    banco: 'Brasil',
    contaBancaria: '',
    naturezaDespesa: 'Custeio',
    valorGlobal: '',
    repasseParticipe: '',
    repasseSeap: '',
    situacaoRepasseSeap: 'Solicitado',
    saldoConta: '',
    dataAtualizacaoSaldoConta: '',
    saldoEconomicidade: '',
    rendimentoAplicacaoExistente: '',
    rendimentoAplicacaoAutorizado: '',
    recursoExecutado: '',
    percentualExecutado: '',
  },
  planoTrabalho: { itens: [createPlanoItem()] },
  processoContratacao: {
    processoSei: '',
    statusProcesso: 'Em instrução',
    transferegovProcesso: 'Sim',
    neNumero: '',
    neData: '',
    neValor: '',
    neFonte: '',
    neSei: '',
    contratoNumero: '',
    contratoSei: '',
    transferegovContrato: 'Sim',
    valorUnitarioContratado: '',
    valorTotalContratado: '',
    quantidadeContratada: '',
    enteContratado: '',
    cnpjContratado: '',
    gestor: '',
    portariaGestorSei: '',
    fiscal: '',
    portariaFiscalSei: '',
    notaFiscalNumero: '',
    notaFiscalSei: '',
    informacaoGestorSei: '',
    termoRecebimentoProvisorioSei: '',
    termoRecebimentoDefinitivoSei: '',
    obNumero: '',
    obData: '',
    obValor: '',
    obFonte: '',
    obSei: '',
    tomboNumero: '',
    guiaTombamentoSei: '',
    fotoSei: '',
    transferegovEntrega: 'Sim',
    termoEntregaSei: '',
    relatorioBeneficiados: '',
    localizacao: '',
    unidadeBeneficiada: '',
  },
  processoContratacaoRegistros: [],
  gestaoInstrumento: {
    publicacaoInstitucional: 'Solicitada',
    fiscalInstrumento: '',
    portariaFiscalSei: '',
    substatus: 'Sem alterações',
    oficioSei: '',
    prorrogacaoStatus: 'Não iniciado',
    prorrogacaoSolicitacaoSei: '',
    prorrogacaoAutorizacaoSei: '',
    prorrogacaoNovoPeriodo: '',
    prorrogacaoTermoAditivo: '',
    ajustePlanoStatus: 'Não iniciado',
    ajustePlanoSolicitacaoSei: '',
    ajustePlanoAutorizacaoSei: '',
    ajustePlanoDocumentoAutorizador: '',
    ajustePlanoHistorico: '',
    saldoRendimentoStatus: 'Não iniciado',
    saldoRendimentoSolicitacaoSei: '',
    saldoRendimentoAutorizacaoSei: '',
    saldoRendimentoDocumentoAutorizador: '',
    saldoRendimentoValorAutorizado: '',
    suplementacaoStatus: 'Não iniciado',
    suplementacaoSolicitacaoSei: '',
    suplementacaoAutorizacaoSei: '',
    suplementacaoDocumentoAutorizador: '',
    suplementacaoValorAutorizado: '',
    prestacaoGestaoStatus: 'Não iniciado',
    prestacaoGestaoEspecie: 'Anual',
    prestacaoGestaoPeriodo: '',
    prestacaoGestaoPeriodoInicio: '',
    prestacaoGestaoPeriodoFim: '',
    prestacaoGestaoRelatorioSei: '',
    prestacaoGestaoUploadRelatorio: '',
    prestacaoGestaoDocumentoEnvioSei: '',
    prestacaoGestaoAnalise: '',
    prestacaoGestaoAnaliseAreaTecnica: '',
    prestacaoGestaoAnaliseDocumentoSei: '',
    prestacaoGestaoAnaliseStatus: 'Em conformidade',
    prestacaoGestaoComplementacaoStatus: 'Em análise',
    prestacaoGestaoComplementacaoDocumentoRespostaSei: '',
    prestacaoGestaoComplementacaoDocumentoAnaliseSei: '',
  },
  ajustePt: {
    status: 'Não iniciado',
    documentoSolicitacaoSei: '',
    documentoAutorizacaoSei: '',
    uploadDocumentoAutorizador: '',
    historicoMudancas: '',
    impactoFinanceiro: '',
    observacoes: '',
  },
  documentos: {
    termoAdesao: '',
    termoConvenio: '',
    planoAcao: '',
    espelhoEmendaParlamentar: '',
    decisaoPenaPecuniaria: '',
    termoColaboracao: '',
    termoFomento: '',
    acordoCooperacaoTecnica: '',
    termoAditivo: '',
    relatorios: '',
    documentoAutorizador: '',
  },
  filtros: {
    politicaSegmentoEixo: 'Saúde e qualidade de vida do servidor',
    setorCorrelacionado: '',
    anoFormalizacao: '',
    anoExecucao: '',
    instrumento: 'Convênio',
    localBeneficiado: '',
    objeto: '',
  },
  prestacaoContas: {
    statusPrestacaoGlobal: 'Não iniciada',
    tipoPrestacao: 'Parcial',
    periodoReferenciaInicio: '',
    periodoReferenciaFim: '',
    dataProtocolo: '',
    dataAnalise: '',
    dataConclusao: '',
    responsavelPrestacao: '',
    setorResponsavel: '',
    statusAnaliseGlobal: 'Em elaboração',
    valorGlobalAprovado: '',
    valorGlobalExecutado: '',
    valorGlobalComprovado: '',
    valorGlobalGlosado: '',
    valorGlobalADevolver: '',
    saldoGlobalDisponivel: '',
    percentualGlobalExecutado: '',
    percentualGlobalComprovado: '',
    totalItensPrestados: '',
    totalItensPendentes: '',
    totalItensGlosados: '',
    totalItensAprovados: '',
    resultadoFinalGlobal: 'Aguardando conclusão',
    motivoGlosaGlobal: '',
    valorDevolucaoGlobal: '',
    dataDevolucaoGlobal: '',
    contaEncerrada: 'Não',
    observacoesFinais: '',
    itens: [],
  },
};

function isFilled(value: unknown) {
  return typeof value === 'string' ? Boolean(value.trim()) : Boolean(value);
}

function requiredFields<T extends object, K extends keyof T>(
  data: T,
  labels: Partial<Record<K, string>>,
  keys: K[],
) {
  return keys.filter((key) => !isFilled(data[key])).map((key) => labels[key] ?? String(key));
}

const validationStepLabels: Record<CadastroStepKey, string> = {
  'dados-gerais': 'Dados Gerais',
  'plano-trabalho': 'Plano de Ação',
  'processo-contratacao': 'Processo de Contratação',
  'gestao-instrumento': 'Gestão do Instrumento',
  'ajuste-pt': 'Ajuste do Plano',
  'documentos': 'Documentos',
  'filtros': 'Filtros Gerenciais',
};

export function validateCadastroForm(data: CadastroInstrumentoFormData): CadastroValidationSummary {
  const missingByStep: Record<CadastroStepKey, string[]> = {
    'dados-gerais': requiredFields(
      data.dadosGerais,
      {
        numeroInternoSeap: 'Nº Interno SEAP',
        alertas: 'Alertas',
        status: 'Status',
        modalidade: 'Modalidade',
        normativo: 'Normativo',
        instrumento: 'Instrumento',
        numeroInstrumento: 'Nº',
        anoFormalizacao: 'Ano de formalização',
        prazoValidade: 'Prazo de validade',
        vigenciaInicial: 'Vigência Inicial',
        vigenciaFinal: 'Vigência Final',
        uploadTermo: 'Upload de termo / referência SEI',
        repasseFinanceiro: 'Repasse financeiro?',
        valorGlobal: 'Valor Global',
      },
      [
        'numeroInternoSeap',
        'alertas',
        'status',
        'modalidade',
        'normativo',
        'instrumento',
        'numeroInstrumento',
        'anoFormalizacao',
        'prazoValidade',
        'vigenciaInicial',
        'vigenciaFinal',
        'uploadTermo',
        'repasseFinanceiro',
        'valorGlobal',
      ],
    ),
    'plano-trabalho': data.planoTrabalho.itens.length
      ? data.planoTrabalho.itens.flatMap((item, index) =>
          requiredFields(
            item,
            {
              categoriaItemObjeto: 'Categoria do Item / Objeto',
              item: 'Item',
              quantidade: 'Quantidade',
              unidadeMedida: 'Unidade de Medida',
              valorUnitarioAutorizado: 'Valor Unitário Autorizado',
              documentoAutorizacao: 'Documento de Autorização',
              monitorado: 'Monitorado?',
            },
            [
              'categoriaItemObjeto',
              'item',
              'quantidade',
              'unidadeMedida',
              'valorUnitarioAutorizado',
              'documentoAutorizacao',
              'monitorado',
            ],
          ).map((field) => `Item ${index + 1}: ${field}`),
        )
      : ['Adicionar pelo menos um item do plano'],
    'processo-contratacao': data.processoContratacaoRegistros.length
      ? data.processoContratacaoRegistros.flatMap((registro, index) =>
          requiredFields(
            registro,
            {
              processoSei: 'Processo SEI nº',
              statusProcesso: 'Status de processo',
              contratoNumero: 'Contrato nº',
              enteContratado: 'Ente Contratado',
              valorUnitarioContratado: 'Valor Unitário Contratado',
              quantidadeContratada: 'Quantidade Contratada',
            },
            [
              'processoSei',
              'statusProcesso',
              'contratoNumero',
              'enteContratado',
              'valorUnitarioContratado',
              'quantidadeContratada',
            ],
          ).map((field) => `Contratação ${index + 1}: ${field}`),
        )
      : ['Adicionar pelo menos uma contratação'],
    'gestao-instrumento': requiredFields(
      data.gestaoInstrumento,
      {
        publicacaoInstitucional: 'Publicação no DOE, site e PNCP',
        substatus: 'Substatus',
        oficioSei: 'Ofício SEI nº',
      },
      ['publicacaoInstitucional', 'substatus', 'oficioSei'],
    ),
    'ajuste-pt': requiredFields(
      data.ajustePt,
      {
        status: 'Status',
      },
      ['status'],
    ),
    'documentos': [],
    'filtros': [],
  };

  const steps = cadastroSteps.map((step) => ({
    key: step.key,
    label: validationStepLabels[step.key],
    missing: missingByStep[step.key],
  }));

  const totalMissing = steps.reduce((sum, step) => sum + step.missing.length, 0);
  const firstIncompleteStep = steps.find((step) => step.missing.length > 0)?.key ?? null;

  return {
    steps,
    missingByStep,
    totalMissing,
    firstIncompleteStep,
    canSave: totalMissing === 0,
  };
}
