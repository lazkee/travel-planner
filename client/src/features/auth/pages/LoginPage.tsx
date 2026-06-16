import { useState } from 'react'
import type * as React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import Input from '../../../components/ui/Input'
import { useAuth } from '../../../context/AuthContext'

type LocationState = {
  from?: string
}

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
        {error ? <ErrorAlert message={error} /> : null}

        <Input
          autoComplete="email"
          disabled={isSubmitting}
          label="Email"
          name="email"
          onChange={handleChange}
          required
          type="email"
          value={formData.email}
        />

        <Input
          autoComplete="current-password"
          disabled={isSubmitting}
          label="Password"
          name="password"
          onChange={handleChange}
          required
          type="password"
          value={formData.password}
        />

        <Button
          className="w-full"
          isLoading={isSubmitting}
          type="submit"
          variant="primary"
        >
          Log in
        </Button>
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
