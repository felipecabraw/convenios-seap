import { CadastroFieldConfig, DocumentoForm, documentosFieldGroups } from '../../../data/cadastro';
import { FormSection, TextField } from '../fields';

function renderField(
  field: CadastroFieldConfig<keyof DocumentoForm>,
  data: DocumentoForm,
  onChange: <K extends keyof DocumentoForm>(field: K, value: DocumentoForm[K]) => void,
) {
  return (
    <TextField
      key={field.key}
      label={field.label}
      value={data[field.key]}
      span={field.span}
      placeholder="Informe link, ID ou documento SEI"
      onChange={(nextValue) => onChange(field.key, nextValue)}
    />
  );
}

export function DocumentosStep({
  data,
  onChange,
}: {
  data: DocumentoForm;
  onChange: <K extends keyof DocumentoForm>(field: K, value: DocumentoForm[K]) => void;
}) {
  return (
    <>
      {documentosFieldGroups.map((group) => (
        <FormSection key={group.title} title={group.title} description={group.description}>
          {group.fields.map((field) => renderField(field, data, onChange))}
        </FormSection>
      ))}
    </>
  );
}
