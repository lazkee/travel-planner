function MyTripsPage() {
  return (
    <section className="grid max-w-4xl gap-6">
      <header className="grid gap-2">
        <p className="m-0 text-[0.82rem] font-extrabold tracking-[0.08em] text-blue-600 uppercase">
          Trips
        </p>
        <h1 className="m-0 text-3xl leading-tight font-bold text-slate-900">
          My Trips
        </h1>
      </header>

      <div className="rounded-lg border border-slate-200 bg-white p-8">
        <h2 className="mb-2.5 text-xl font-bold text-slate-900">
          No trips yet
        </h2>
      </div>
    </section>
  )
}

export default MyTripsPage
