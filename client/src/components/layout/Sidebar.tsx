import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

type SidebarProps = {
  variant?: 'authenticated' | 'guest'
}

function Sidebar({ variant = 'authenticated' }: SidebarProps) {
  const { logout, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const linkClassName =
    'flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-left font-bold text-white no-underline transition hover:bg-white/[0.12] md:justify-start'
  const isGuest = variant === 'guest'
  const displayName = isGuest ? 'Guest' : user?.name || user?.email || 'Traveler'
  const secondaryText = isGuest ? 'Viewing shared trip' : user?.email
  const sharedPath = isGuest ? '/shared' : '/app/shared'
  const isSharedActive =
    location.pathname.startsWith('/shared') ||
    location.pathname.startsWith('/app/shared')

  function handleAuthAction() {
    if (isGuest) {
      navigate('/login')
      return
    }

    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className="box-border flex gap-3 bg-[#101828] p-3 text-white md:fixed md:left-0 md:top-0 md:h-screen md:h-dvh md:w-[280px] md:flex-col md:overflow-hidden md:px-[18px] md:py-6"
      aria-label="Application navigation"
    >
      <nav className="grid flex-1 gap-2 md:flex-none">
        <NavLink
          className={({ isActive }) =>
            isActive ? `${linkClassName} bg-white/[0.12]` : linkClassName
          }
          to={isGuest ? '/login' : '/app/trips'}
        >
          My Trips
        </NavLink>
        <NavLink
          className={() =>
            isSharedActive ? `${linkClassName} bg-white/[0.12]` : linkClassName
          }
          to={sharedPath}
        >
          Shared
        </NavLink>
      </nav>
      <div className="flex items-center gap-3 md:mt-auto md:block md:space-y-3">
        <div className="hidden min-w-0 md:block">
          <p className="m-0 truncate text-sm font-bold text-white">
            {displayName}
          </p>
          {secondaryText ? (
            <p className="m-0 truncate text-xs text-slate-300">
              {secondaryText}
            </p>
          ) : null}
        </div>
        <button
          className="flex w-full items-center justify-center whitespace-nowrap rounded-lg border-0 bg-white/[0.08] px-3 py-2.5 text-left font-bold text-white transition hover:bg-white/[0.14] md:justify-start"
          type="button"
          onClick={handleAuthAction}
        >
          {isGuest ? 'Login' : 'Logout'}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
