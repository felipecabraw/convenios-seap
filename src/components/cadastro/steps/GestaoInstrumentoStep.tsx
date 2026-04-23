import {
  CadastroFieldConfig,
  GestaoInstrumentoForm,
  gestaoInstrumentoFieldGroups,
} from '../../../data/cadastro';
import { CurrencyField, DateField, FileField, FormSection, SelectField, TextField } from '../fields';

function renderField(
  field: CadastroFieldConfig<keyof GestaoInstrumentoForm>,
  data: GestaoInstrumentoForm,
  onChange: <K extends keyof GestaoInstrumentoForm>(field: K, value: GestaoInstrumentoForm[K]) => void,
) {
  const value = data[field.key];

  if (field.kind === 'select') {
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
  }

  if (field.kind === 'currency') {
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
  }

  if (field.kind === 'file') {
    return (
      <FileField
        key={field.key}
        label={field.label}
        value={value}
        accept={field.accept}
        hint={field.hint}
        span={field.span}
        onChange={(nextValue) => onChange(field.key, nextValue)}
      />
    );
  }

  if (field.kind === 'date') {
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
  }

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

export function GestaoInstrumentoStep({
  data,
  onChange,
}: {
  data: GestaoInstrumentoForm;
  onChange: <K extends keyof GestaoInstrumentoForm>(field: K, value: GestaoInstrumentoForm[K]) => void;
}) {
  return (
    <>
      {gestaoInstrumentoFieldGroups.map((group) => (
        <FormSection key={group.title} title={group.title} description={group.description}>
          {group.fields.map((field) => renderField(field, data, onChange))}
        </FormSection>
      ))}
    </>
  );
}
