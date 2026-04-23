import type { CSSProperties } from 'react';
import {
  CadastroFieldConfig,
  DadosGeraisForm,
  dadosGeraisFieldGroups,
} from '../../../data/cadastro';
import { CalculatedField, CurrencyField, DateField, FileField, FormSection, SelectField, TextAreaField, TextField } from '../fields';

function renderField(
  field: CadastroFieldConfig<keyof DadosGeraisForm>,
  data: DadosGeraisForm,
  onChange: <K extends keyof DadosGeraisForm>(field: K, value: DadosGeraisForm[K]) => void,
) {
  const value = data[field.key];

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
          onChange={(nextValue) => onChange(field.key, nextValue)}
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
          onChange={(nextValue) => onChange(field.key, nextValue)}
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
          onChange={(nextValue) => onChange(field.key, nextValue)}
        />
      );
    case 'textarea':
      return (
        <TextAreaField
          key={field.key}
          label={field.label}
          value={value}
          hint={field.hint}
          placeholder={field.placeholder}
          span={field.span}
          onChange={(nextValue) => onChange(field.key, nextValue)}
        />
      );
    case 'file':
      return (
        <FileField
          key={field.key}
          label={field.label}
          value={value}
          hint={field.hint}
          accept={field.accept}
          span={field.span}
          onChange={(nextValue) => onChange(field.key, nextValue)}
        />
      );
    case 'calculated':
      return <CalculatedField key={field.key} label={field.label} value={value} hint={field.hint} span={field.span} />;
    default:
      return (
        <TextField
          key={field.key}
          label={field.label}
          value={value}
          hint={field.hint}
          span={field.span}
          onChange={(nextValue) => onChange(field.key, nextValue)}
        />
      );
  }
}

const dadosGeraisSectionAccents = [
  '#1c4071',
  '#c78c41',
  '#1f7a49',
  '#5c7297',
  '#0f766e',
  '#7c3aed',
  '#b42318',
  '#4f73a6',
  '#0891b2',
  '#8b5cf6',
  '#d94b64',
  '#a16207',
  '#64748b',
] as const;

export function DadosGeraisStep({
  data,
  onChange,
}: {
  data: DadosGeraisForm;
  onChange: <K extends keyof DadosGeraisForm>(field: K, value: DadosGeraisForm[K]) => void;
}) {
  const overview = [
    {
      key: 'status',
      tone: 'primary',
      label: 'Status operacional',
      value: data.status || 'A definir',
      detail: data.alertas || 'Sem alerta ativo',
    },
    {
      key: 'clausula',
      tone: 'danger',
      label: 'Cláusula suspensiva',
      value: data.diasRestanteClausulaSuspensiva || 'A definir',
      detail: data.dataFinalClausulaSuspensiva || 'Defina a data final',
    },
    {
      key: 'vigencia',
      tone: 'secondary',
      label: 'Vigência',
      value: data.diasRestantes || 'A definir',
      detail: data.vigenciaFinal || 'Defina a vigência final',
    },
    {
      key: 'repasse',
      tone: data.repasseFinanceiro === 'Não' ? 'warning' : 'success',
      label: 'Repasse financeiro',
      value: data.repasseFinanceiro || 'A definir',
      detail: data.instrumento || 'Instrumento selecionado',
    },
  ] as const;

  return (
    <>
      <section className="dados-gerais-overview" aria-label="Resumo do cadastro">
        {overview.map((card) => (
          <article key={card.key} className={`dados-gerais-overview__card dados-gerais-overview__card--${card.tone}`}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.detail}</small>
          </article>
        ))}
      </section>

      {dadosGeraisFieldGroups.map((group, index) => {
        const accent = dadosGeraisSectionAccents[index % dadosGeraisSectionAccents.length];

        return (
          <FormSection
            key={group.title}
            title={group.title}
            description={group.description}
            style={{ '--section-accent': accent } as CSSProperties}
            className="form-section--dados-gerais"
          >
            {group.fields.map((field) => renderField(field, data, onChange))}
          </FormSection>
        );
      })}
    </>
  );
}
