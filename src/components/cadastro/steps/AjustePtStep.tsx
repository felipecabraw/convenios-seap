import { AjustePtForm, CadastroFieldConfig, ajustePtFieldGroups } from '../../../data/cadastro';
import { CurrencyField, FormSection, SelectField, TextField } from '../fields';

function renderField(
  field: CadastroFieldConfig<keyof AjustePtForm>,
  data: AjustePtForm,
  onChange: <K extends keyof AjustePtForm>(field: K, value: AjustePtForm[K]) => void,
) {
  const value = data[field.key];

  if (field.kind === 'select') {
    return (
      <SelectField key={field.key} label={field.label} value={value} options={field.options ?? []} span={field.span} onChange={(nextValue) => onChange(field.key, nextValue)} />
    );
  }

  if (field.kind === 'currency') {
    return <CurrencyField key={field.key} label={field.label} value={value} span={field.span} onChange={(nextValue) => onChange(field.key, nextValue)} />;
  }

  return <TextField key={field.key} label={field.label} value={value} span={field.span} onChange={(nextValue) => onChange(field.key, nextValue)} />;
}

export function AjustePtStep({
  data,
  onChange,
}: {
  data: AjustePtForm;
  onChange: <K extends keyof AjustePtForm>(field: K, value: AjustePtForm[K]) => void;
}) {
  return (
    <>
      {ajustePtFieldGroups.map((group) => (
        <FormSection key={group.title} title={group.title} description={group.description}>
          {group.fields.map((field) => renderField(field, data, onChange))}
        </FormSection>
      ))}
    </>
  );
}
