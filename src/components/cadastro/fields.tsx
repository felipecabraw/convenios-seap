import { ChangeEvent, CSSProperties, ReactNode } from 'react';
import { SelectOption } from '../../data/cadastro';

type BaseFieldProps = {
  label: string;
  hint?: string;
  placeholder?: string;
  span?: 'full' | 'half' | 'third' | 'quarter';
  required?: boolean;
};

type TextFieldProps = BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
};

type TextAreaFieldProps = BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
};

type SelectFieldProps = BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
};

type DateFieldProps = BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
};

type CurrencyFieldProps = BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
};

type FileFieldProps = BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  accept?: string;
};

type CalculatedFieldProps = BaseFieldProps & {
  value: string;
};

export function FormSection({
  title,
  description,
  children,
  className,
  style,
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section className={className ? `form-section ${className}` : 'form-section'} style={style}>
      <div className="form-section__header">
        <div className="section-kicker section-kicker--detail">{title}</div>
        <p>{description}</p>
      </div>
      <div className="form-grid">{children}</div>
    </section>
  );
}

function spanClass(span?: BaseFieldProps['span']) {
  if (span === 'full') return 'form-field form-field--full';
  if (span === 'third') return 'form-field form-field--third';
  if (span === 'quarter') return 'form-field form-field--quarter';
  return 'form-field';
}

function FieldShell({
  label,
  hint,
  span,
  required,
  children,
}: BaseFieldProps & { children: ReactNode }) {
  return (
    <label className={spanClass(span)}>
      <span className="form-field__label">
        {label}
        {required ? <span className="form-field__required" aria-hidden="true"> *</span> : null}
      </span>
      {children}
      {hint ? <small className="form-field__hint">{hint}</small> : null}
    </label>
  );
}

export function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = 'text',
  span,
  required,
}: TextFieldProps) {
  return (
    <FieldShell label={label} hint={hint} span={span} required={required}>
      <input
        className="form-input"
        value={value}
        type={type}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 2,
  span,
  required,
}: TextAreaFieldProps) {
  return (
    <FieldShell label={label} hint={hint} span={span} required={required}>
      <textarea
        className="form-input form-input--textarea"
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  hint,
  value,
  onChange,
  options,
  span,
  required,
}: SelectFieldProps) {
  const hasSelectedValue = options.some((option) => option.value === value);

  return (
    <FieldShell label={label} hint={hint} span={span} required={required}>
      <select
        className="form-input form-input--select"
        value={hasSelectedValue ? value : ''}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="" disabled>
          Selecione uma opção
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function DateField({ label, hint, value, onChange, span }: DateFieldProps) {
  return (
    <FieldShell label={label} hint={hint} span={span}>
      <input className="form-input" type="date" value={value} onChange={(event) => onChange(event.target.value)} />
    </FieldShell>
  );
}

function handleCurrencyInput(event: ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) {
  const cleanValue = event.target.value.replace(/[^\d.,]/g, '');
  onChange(cleanValue);
}

export function CurrencyField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  span,
  required,
}: CurrencyFieldProps) {
  return (
    <FieldShell label={label} hint={hint} span={span} required={required}>
      <div className="currency-input">
        <span>R$</span>
        <input
          className="form-input form-input--currency"
          value={value}
          placeholder={placeholder ?? '0,00'}
          onChange={(event) => handleCurrencyInput(event, onChange)}
        />
      </div>
    </FieldShell>
  );
}

export function FileField({
  label,
  hint,
  value,
  onChange,
  accept,
  span,
  required,
}: FileFieldProps) {
  return (
    <FieldShell label={label} hint={hint} span={span} required={required}>
      <div className="form-file">
        <input
          className="form-input form-input--file"
          type="file"
          accept={accept}
          onChange={(event) => {
            const file = event.target.files?.[0];
            onChange(file ? file.name : '');
          }}
        />
        <div className="form-file__action" aria-hidden="true">
          <span className="material-symbols-outlined">upload_file</span>
          <strong>Selecionar documento</strong>
        </div>
        <div className="form-file__meta">
          <span className="form-file__label">{value || 'Nenhum arquivo anexado'}</span>
          <small>{value ? 'Arquivo pronto para integração futura' : 'Selecione um arquivo para vincular ao registro'}</small>
        </div>
      </div>
    </FieldShell>
  );
}

export function CalculatedField({ label, hint, value, span }: CalculatedFieldProps) {
  return (
    <FieldShell label={label} hint={hint} span={span}>
      <div className="calculated-field">{value || 'Calculado automaticamente'}</div>
    </FieldShell>
  );
}

export function EmptyModuleState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="empty-module-state">
      <div className="section-kicker">Estrutura em aberto</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="empty-module-state__note">
        Assim que a linha 2 da planilha for expandida, este módulo pode ser renderizado automaticamente no mesmo padrão.
      </div>
    </section>
  );
}
