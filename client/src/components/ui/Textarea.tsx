import type { TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
}

function Textarea({ className = '', id, label, name, ...props }: TextareaProps) {
  const textareaId = id ?? name

  return (
    <div className="grid gap-2">
      <label className="text-[0.92rem] font-bold text-slate-900" htmlFor={textareaId}>
        {label}
      </label>
      <textarea
        className={[
          'min-h-24 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-[11px] text-slate-900 outline-none focus:border-blue-600 focus:ring-[3px] focus:ring-blue-600/15 disabled:bg-slate-50',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        id={textareaId}
        name={name}
        {...props}
      />
    </div>
  )
}

export default Textarea
