import type { SelectHTMLAttributes } from 'react'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
}

function Select({ children, className = '', id, label, name, ...props }: SelectProps) {
  const selectId = id ?? name

  const selectElement = (
    <select
      className={[
        'w-full rounded-lg border border-slate-200 bg-white px-3 py-[11px] text-slate-900 outline-none focus:border-blue-600 focus:ring-[3px] focus:ring-blue-600/15 disabled:bg-slate-50',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      id={selectId}
      name={name}
      {...props}
    >
      {children}
    </select>
  )

  if (!label) {
    return selectElement
  }

  return (
    <div className="grid gap-2">
      <label className="text-[0.92rem] font-bold text-slate-900" htmlFor={selectId}>
        {label}
      </label>
      {selectElement}
    </div>
  )
}

export default Select
