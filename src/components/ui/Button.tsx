import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-[#1f6f5f] text-white border-[#1f6f5f] hover:bg-[#18594d]',
  secondary: 'bg-white text-slate-800 border-slate-200 hover:border-slate-300',
  ghost: 'bg-transparent text-slate-700 border-transparent hover:bg-slate-100',
  danger: 'bg-white text-red-700 border-red-200 hover:bg-red-50',
}

export function Button({ variant = 'primary', icon, className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition duration-200 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`}
      type="button"
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
