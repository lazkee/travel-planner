import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

function AppLayout() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f3f6fb]">
      <Sidebar />
      <div className="flex min-w-0 flex-col md:ml-[280px] md:min-h-screen">
        <Topbar />
        <main className="flex-1 px-5 py-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
