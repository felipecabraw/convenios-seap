import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
}

export function Input({ label, helperText, error, className = '', ...props }: InputProps) {
  return (
    <label className="grid gap-2 text-sm text-slate-700">
      {label && <span className="font-semibold">{label}</span>}
      <input
        className={`min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.02)] transition focus:border-[#1f6f5f] ${className}`}
        {...props}
      />
      {helperText && <span className="text-xs text-slate-500">{helperText}</span>}
      {error && <span className="text-xs text-red-700">{error}</span>}
    </label>
  )
}
