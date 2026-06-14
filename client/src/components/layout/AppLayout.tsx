import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f3f6fb] md:grid md:grid-cols-[248px_minmax(0,1fr)]">
      <Sidebar />
      <div className="flex min-w-0 flex-col">
        <Topbar />
        <main className="flex-1 px-5 py-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
