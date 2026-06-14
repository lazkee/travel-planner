import type { InputHTMLAttributes } from 'react'

type DateInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
}

function DateInput({ className = '', id, label, name, ...props }: DateInputProps) {
  const inputId = id ?? name

  return (
    <div className="grid gap-2">
      <label className="text-[0.92rem] font-bold text-slate-900" htmlFor={inputId}>
        {label}
      </label>
      <input
        className={[
          'w-full rounded-lg border border-slate-200 bg-white px-3 py-[11px] text-slate-900 outline-none focus:border-blue-600 focus:ring-[3px] focus:ring-blue-600/15 disabled:bg-slate-50',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        id={inputId}
        name={name}
        type="date"
        {...props}
      />
    </div>
  )
}

export default DateInput
