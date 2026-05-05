import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  return (
    <label className="grid gap-2 text-sm text-slate-700">
      {label && <span className="font-semibold">{label}</span>}
      <textarea
        className={`min-h-24 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition focus:border-[#1f6f5f] ${className}`}
        {...props}
      />
    </label>
  )
}
