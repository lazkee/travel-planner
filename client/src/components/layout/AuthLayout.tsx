import { Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f3f6fb] px-5 py-8 text-slate-900">
      <Outlet />
    </main>
  )
}

export default AuthLayout
