type ShareStatusBadgeProps = {
  isExpired: boolean
}

function ShareStatusBadge({ isExpired }: ShareStatusBadgeProps) {
  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ring-1',
        isExpired
          ? 'bg-slate-100 text-slate-500 ring-slate-200'
          : 'bg-emerald-50 text-emerald-700 ring-emerald-100',
      ].join(' ')}
    >
      {isExpired ? 'Expired' : 'Active'}
    </span>
  )
}

export default ShareStatusBadge
