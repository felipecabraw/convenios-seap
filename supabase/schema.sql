create extension if not exists "pgcrypto";

create table if not exists processos (
  id uuid primary key default gen_random_uuid(),
  codigo_referencia text not null unique,
  instrumento text not null,
  modalidade text,
  status text not null,
  ano_formalizacao integer,
  vigencia_inicial date,
  vigencia_final date,
  valor_global numeric(14,2) default 0,
  concedente_nome text,
  convenente_nome text,
  unidade_responsavel text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists instrumentos_dados_gerais (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references processos(id) on delete cascade,
  numero_interno_seap text not null,
  numero_instrumento text,
  normativo text,
  eixo text,
  banco text,
  conta_bancaria text,
  natureza_despesa text,
  repasse_participe numeric(14,2) default 0,
  repasse_seap numeric(14,2) default 0,
  situacao_repasse_seap text,
  saldo_conta numeric(14,2) default 0,
  data_atualizacao_saldo_conta date,
  rendimento_aplicacao_autorizado numeric(14,2) default 0,
  rendimento_aplicacao_existente numeric(14,2) default 0,
  recurso_executado numeric(14,2) default 0,
  percentual_executado numeric(7,2) default 0,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (processo_id)
);

create table if not exists plano_itens (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references processos(id) on delete cascade,
  codigo_item text,
  categoria text not null,
  descricao text not null,
  quantidade numeric(14,2) default 0,
  unidade_medida text,
  valor_unitario_autorizado numeric(14,2) default 0,
  valor_total_autorizado numeric(14,2) default 0,
  documento_autorizacao text,
  monitorado boolean not null default true,
  fruto_ajuste boolean not null default false,
  status_item_plano text,
  ordem_exibicao integer default 0,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contratacoes (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references processos(id) on delete cascade,
  processo_sei text not null,
  status_processo text,
  contrato_numero text,
  contrato_sei text,
  ente_contratado text,
  cnpj_contratado text,
  quantidade_contratada numeric(14,2) default 0,
  valor_unitario_contratado numeric(14,2) default 0,
  valor_total_contratado numeric(14,2) default 0,
  gestor text,
  fiscal text,
  localizacao text,
  unidade_beneficiada text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contratacao_itens_vinculados (
  id uuid primary key default gen_random_uuid(),
  contratacao_id uuid not null references contratacoes(id) on delete cascade,
  plano_item_id uuid not null references plano_itens(id) on delete cascade,
  quantidade_contratada numeric(14,2) default 0,
  valor_unitario_contratado numeric(14,2) default 0,
  valor_total_contratado numeric(14,2) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (contratacao_id, plano_item_id)
);

create table if not exists gestao_instrumento (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references processos(id) on delete cascade,
  publicacao_institucional text,
  substatus text,
  oficio_sei text,
  prorrogacao_status text,
  ajuste_plano_status text,
  suplementacao_status text,
  prestacao_gestao_status text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (processo_id)
);

create table if not exists ajustes_pt (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references processos(id) on delete cascade,
  status text not null,
  documento_autorizacao_sei text,
  observacoes text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists prestacao_contas (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references processos(id) on delete cascade,
  status_prestacao_global text not null,
  tipo_prestacao text,
  responsavel_prestacao text,
  status_analise_global text,
  valor_global_executado numeric(14,2) default 0,
  valor_global_comprovado numeric(14,2) default 0,
  valor_global_glosado numeric(14,2) default 0,
  valor_global_aprovado numeric(14,2) default 0,
  valor_global_a_devolver numeric(14,2) default 0,
  saldo_global_disponivel numeric(14,2) default 0,
  percentual_global_executado numeric(7,2) default 0,
  percentual_global_comprovado numeric(7,2) default 0,
  resultado_final_global text,
  observacoes_finais text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (processo_id)
);

create table if not exists prestacao_itens (
  id uuid primary key default gen_random_uuid(),
  prestacao_id uuid not null references prestacao_contas(id) on delete cascade,
  plano_item_id uuid not null references plano_itens(id) on delete cascade,
  quantidade_executada numeric(14,2) default 0,
  valor_executado_item numeric(14,2) default 0,
  valor_comprovado_item numeric(14,2) default 0,
  valor_glosado_item numeric(14,2) default 0,
  saldo_nao_utilizado_item numeric(14,2) default 0,
  status_item_prestacao text,
  observacao_item text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (prestacao_id, plano_item_id)
);

create table if not exists historico_eventos (
  id uuid primary key default gen_random_uuid(),
  processo_id uuid not null references processos(id) on delete cascade,
  categoria text not null,
  titulo text not null,
  descricao text,
  tom text,
  data_evento timestamptz not null default now(),
  actor text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_processos_status on processos(status);
create index if not exists idx_processos_vigencia_final on processos(vigencia_final);
create index if not exists idx_plano_itens_processo on plano_itens(processo_id);
create index if not exists idx_contratacoes_processo on contratacoes(processo_id);
create index if not exists idx_prestacao_itens_prestacao on prestacao_itens(prestacao_id);
create index if not exists idx_historico_eventos_processo on historico_eventos(processo_id, data_evento desc);
