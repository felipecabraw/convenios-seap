import { CadastroFieldConfig, FiltrosForm, filtrosFieldGroups } from '../../../data/cadastro';
import { FormSection, SelectField, TextField } from '../fields';

function renderField(
  field: CadastroFieldConfig<keyof FiltrosForm>,
  data: FiltrosForm,
  onChange: <K extends keyof FiltrosForm>(field: K, value: FiltrosForm[K]) => void,
) {
  const value = data[field.key];

  if (field.kind === 'select') {
    return (
      <SelectField key={field.key} label={field.label} value={value} options={field.options ?? []} span={field.span} onChange={(nextValue) => onChange(field.key, nextValue)} />
    );
  }

  return <TextField key={field.key} label={field.label} value={value} span={field.span} onChange={(nextValue) => onChange(field.key, nextValue)} />;
}

export function FiltrosStep({
  data,
  onChange,
}: {
  data: FiltrosForm;
  onChange: <K extends keyof FiltrosForm>(field: K, value: FiltrosForm[K]) => void;
}) {
  return (
    <>
      {filtrosFieldGroups.map((group) => (
        <FormSection key={group.title} title={group.title} description={group.description}>
          {group.fields.map((field) => renderField(field, data, onChange))}
        </FormSection>
      ))}
    </>
  );
}
