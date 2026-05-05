import { Input } from './Input'

interface CurrencyInputProps {
  label: string
  value: number
  onChange: (value: number) => void
}

export function CurrencyInput({ label, value, onChange }: CurrencyInputProps) {
  return (
    <Input
      label={label}
      min={0}
      step="0.01"
      type="number"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  )
}
