import { Input } from './Input'

interface DateInputProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function DateInput({ label, value, onChange }: DateInputProps) {
  return <Input label={label} type="date" value={value} onChange={(event) => onChange(event.target.value)} />
}
