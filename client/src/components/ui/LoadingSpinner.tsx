type LoadingSpinnerProps = {
  label?: string
}

function LoadingSpinner({ label = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white p-8 text-slate-600">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      <span className="font-medium">{label}</span>
    </div>
  )
}

export default LoadingSpinner
