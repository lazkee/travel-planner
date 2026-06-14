import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  isLoading?: boolean
}

const variantClassNames: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600',
  secondary:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:hover:bg-white',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:hover:bg-red-600',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 disabled:hover:bg-transparent',
}

function Button({
  children,
  className = '',
  disabled,
  isLoading = false,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const classNames = [
    'inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-extrabold transition focus:outline-none focus:ring-[3px] focus:ring-blue-600/15 disabled:cursor-not-allowed disabled:opacity-70',
    variantClassNames[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classNames} disabled={disabled || isLoading} type={type} {...props}>
      {isLoading ? 'Please wait...' : children}
    </button>
  )
}

export default Button
