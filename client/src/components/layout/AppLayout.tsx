import { Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

type AppLayoutProps = {
  children?: ReactNode
  variant?: 'authenticated' | 'guest'
}

function AppLayout({
  children,
  variant = 'authenticated',
}: AppLayoutProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f3f6fb]">
      <Sidebar variant={variant} />
      <div className="flex min-w-0 flex-col md:ml-[280px] md:min-h-screen">
        <Topbar variant={variant} />
        <main className="flex-1 px-5 py-6 md:p-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
