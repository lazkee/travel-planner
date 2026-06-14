import { useAuth } from '../../context/AuthContext'

function Topbar() {
  const { user } = useAuth()
  const displayName = user?.name || user?.email || 'Traveler'

  return (
    <header className="flex min-h-[72px] flex-col items-start justify-center gap-1 border-b border-slate-200 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8 md:py-0">
      <h1 className="m-0 text-lg font-bold text-slate-900">TravelPlanner</h1>
      <div className="text-sm md:text-right md:text-[0.95rem]">
        <p className="m-0 font-bold text-slate-900">{displayName}</p>
        {user?.email ? (
          <p className="m-0 text-slate-500">{user.email}</p>
        ) : null}
      </div>
    </header>
  )
}

export default Topbar
