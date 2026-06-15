import { useAuth } from '../../context/AuthContext'

type TopbarProps = {
  variant?: 'authenticated' | 'guest'
}

function Topbar({ variant = 'authenticated' }: TopbarProps) {
  const { user } = useAuth()
  const isGuest = variant === 'guest'
  const displayName = isGuest ? 'Guest' : user?.name || user?.email || 'Traveler'
  const secondaryText = isGuest ? 'Viewing shared trip' : user?.email

  return (
    <header className="flex min-h-[72px] flex-col items-start justify-center gap-1 border-b border-slate-200 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8 md:py-0">
      <h1 className="m-0 text-lg font-bold text-slate-900">TravelPlanner</h1>
      <div className="text-sm md:text-right md:text-[0.95rem]">
        <p className="m-0 font-bold text-slate-900">{displayName}</p>
        {secondaryText ? (
          <p className="m-0 text-slate-500">{secondaryText}</p>
        ) : null}
      </div>
    </header>
  )
}

export default Topbar
