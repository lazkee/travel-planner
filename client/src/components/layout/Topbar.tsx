type TopbarProps = {
  variant?: 'authenticated' | 'guest'
}

function Topbar({ variant: _variant = 'authenticated' }: TopbarProps) {
  return (
    <header className="flex min-h-[72px] items-center justify-center border-b border-slate-200 bg-white px-5 py-4 md:px-8 md:py-0">
      <h1 className="m-0 text-center text-2xl font-extrabold text-slate-900">
        TravelPlanner
      </h1>
    </header>
  )
}

export default Topbar
