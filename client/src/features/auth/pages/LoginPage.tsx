import { useState } from 'react'
import type * as React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../api/apiError'
import { useAuth } from '../../../context/AuthContext'

type LocationState = {
  from?: string
}

const inputClassName =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-[11px] text-slate-900 outline-none focus:border-blue-600 focus:ring-[3px] focus:ring-blue-600/15 disabled:bg-slate-50'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const from = (location.state as LocationState | null)?.from ?? '/app/trips'

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function validateForm() {
    if (!formData.email.trim()) {
      return 'Email is required.'
    }

    if (!formData.password) {
      return 'Password is required.'
    }

    return ''
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await login(formData)
      navigate(from, { replace: true })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="w-full max-w-[420px] rounded-lg border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(16,24,40,0.12)] md:p-8">
      <header className="mb-7">
        <p className="mb-2 text-sm font-extrabold tracking-[0.08em] text-blue-600 uppercase">
          TravelPlanner
        </p>
        <h1 className="m-0 text-[1.8rem] leading-tight font-bold text-slate-900">
          Log in
        </h1>
        <p className="mt-2.5 text-slate-500">Continue planning your trips.</p>
      </header>

      <form className="grid gap-[18px]" onSubmit={handleSubmit}>
        {error ? (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <div className="grid gap-2">
          <label
            className="text-[0.92rem] font-bold text-slate-900"
            htmlFor="login-email"
          >
            Email
          </label>
          <input
            className={inputClassName}
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="grid gap-2">
          <label
            className="text-[0.92rem] font-bold text-slate-900"
            htmlFor="login-password"
          >
            Password
          </label>
          <input
            className={inputClassName}
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
        </div>

        <button
          className="inline-flex w-full items-center justify-center rounded-lg border-0 bg-blue-600 px-4 py-3 font-extrabold text-white transition hover:bg-blue-700 disabled:hover:bg-blue-600"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-[22px] text-center text-slate-500">
        New to TravelPlanner?{' '}
        <Link
          className="font-extrabold text-blue-600 no-underline hover:underline"
          to="/register"
        >
          Create an account
        </Link>
      </p>
    </section>
  )
}

export default LoginPage
