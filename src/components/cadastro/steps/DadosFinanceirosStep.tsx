import type { CSSProperties } from 'react';
import {
  CadastroFieldConfig,
  DadosGeraisForm,
  dadosFinanceirosFieldGroups,
} from '../../../data/cadastro';
import {
  CalculatedField,
  CurrencyField,
  DateField,
  FormSection,
  SelectField,
  TextField,
} from '../fields';

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

const financialSectionAccents = ['#1f7a49', '#0f5b8f', '#c78c41', '#6d7684'] as const;

export function DadosFinanceirosStep({
  data,
  onChange,
}: {
  data: DadosGeraisForm;
  onChange: <K extends keyof DadosGeraisForm>(field: K, value: DadosGeraisForm[K]) => void;
}) {
  const overview = [
    {
      key: 'valor-global',
      tone: 'success',
      label: 'Valor Global',
      value: data.valorGlobal || 'R$ 0,00',
      detail: data.naturezaDespesa || 'Natureza da despesa',
    },
    {
      key: 'repasse-seap',
      tone: 'primary',
      label: 'Repasse SEAP',
      value: data.repasseSeap || 'R$ 0,00',
      detail: data.situacaoRepasseSeap || 'Situação do repasse',
    },
    {
      key: 'saldo-conta',
      tone: 'secondary',
      label: 'Saldo em conta',
      value: data.saldoConta || 'R$ 0,00',
      detail: data.dataAtualizacaoSaldoConta || 'Atualize a data do saldo',
    },
    {
      key: 'execucao',
      tone: 'warning',
      label: 'Execução',
      value: data.percentualExecutado || '0,0%',
      detail: data.recursoExecutado || 'Recurso executado',
    },
  ] as const;

  return (
    <>
      <section className="dados-gerais-overview" aria-label="Resumo financeiro do instrumento">
        {overview.map((card) => (
          <article key={card.key} className={`dados-gerais-overview__card dados-gerais-overview__card--${card.tone}`}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.detail}</small>
          </article>
        ))}
      </section>

      {dadosFinanceirosFieldGroups.map((group, index) => {
        const accent = financialSectionAccents[index % financialSectionAccents.length];

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
