import { useState } from 'react'
import type * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../api/apiError'
import { useAuth } from '../../../context/AuthContext'

const inputClassName =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-[11px] text-slate-900 outline-none focus:border-blue-600 focus:ring-[3px] focus:ring-blue-600/15 disabled:bg-slate-50'
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  function validateForm() {
    if (!formData.name.trim()) {
      return 'Name is required.'
    }

    if (!formData.email.trim()) {
      return 'Email is required.'
    }

    if (!emailPattern.test(formData.email.trim())) {
      return 'Enter a valid email address.'
    }

    if (!formData.password) {
      return 'Password is required.'
    }

    if (formData.confirmPassword !== formData.password) {
      return 'Passwords do not match.'
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
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      navigate('/app/trips', { replace: true })
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
          Create account
        </h1>
        <p className="mt-2.5 text-slate-500">
          Start organizing your travel plans.
        </p>
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
            htmlFor="register-name"
          >
            Name
          </label>
          <input
            className={inputClassName}
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="grid gap-2">
          <label
            className="text-[0.92rem] font-bold text-slate-900"
            htmlFor="register-email"
          >
            Email
          </label>
          <input
            className={inputClassName}
            id="register-email"
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
            htmlFor="register-password"
          >
            Password
          </label>
          <input
            className={inputClassName}
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="grid gap-2">
          <label
            className="text-[0.92rem] font-bold text-slate-900"
            htmlFor="register-confirm-password"
          >
            Confirm password
          </label>
          <input
            className={inputClassName}
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={formData.confirmPassword}
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
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-[22px] text-center text-slate-500">
        Already have an account?{' '}
        <Link
          className="font-extrabold text-blue-600 no-underline hover:underline"
          to="/login"
        >
          Log in
        </Link>
      </p>
    </section>
  )
}

export default RegisterPage
