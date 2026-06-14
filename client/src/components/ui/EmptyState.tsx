import type { ReactNode } from 'react'

type EmptyStateProps = {
  action?: ReactNode
  description?: string
  title: string
}

function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="m-0 text-xl font-bold text-slate-900">{title}</h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-lg text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  )
}

export default EmptyState
