import { useState } from 'react'
import type * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import Input from '../../../components/ui/Input'
import { useAuth } from '../../../context/AuthContext'

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
        {error ? <ErrorAlert message={error} /> : null}

        <Input
          autoComplete="name"
          disabled={isSubmitting}
          label="Name"
          name="name"
          onChange={handleChange}
          required
          type="text"
          value={formData.name}
        />

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
          autoComplete="new-password"
          disabled={isSubmitting}
          label="Password"
          name="password"
          onChange={handleChange}
          required
          type="password"
          value={formData.password}
        />

        <Input
          autoComplete="new-password"
          disabled={isSubmitting}
          label="Confirm password"
          name="confirmPassword"
          onChange={handleChange}
          required
          type="password"
          value={formData.confirmPassword}
        />

        <Button
          className="w-full"
          isLoading={isSubmitting}
          type="submit"
          variant="primary"
        >
          Create account
        </Button>
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
