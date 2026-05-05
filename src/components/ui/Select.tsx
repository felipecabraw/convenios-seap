import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: string[]
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <label className="grid gap-2 text-sm text-slate-700">
      {label && <span className="font-semibold">{label}</span>}
      <select
        className={`min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 transition focus:border-[#1f6f5f] ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
