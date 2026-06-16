import { useCallback, useEffect, useState } from 'react'
import type * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import Input from '../../../components/ui/Input'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import {
  deleteCurrentUserProfile,
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from '../api/profile.api'

type ProfileFormData = {
  name: string
  email: string
}

const emptyFormData: ProfileFormData = {
  name: '',
  email: '',
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function ProfilePage() {
  const { logout, updateCurrentUser } = useAuth()
  const { showError, showSuccess } = useToast()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<ProfileFormData>(emptyFormData)
  const [error, setError] = useState('')
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadProfile = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const profile = await getCurrentUserProfile()
      setFormData({
        name: profile.name,
        email: profile.email,
      })
      setHasLoadedProfile(true)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target

    setFormData((previousFormData) => ({
      ...previousFormData,
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

    if (!isValidEmail(formData.email.trim())) {
      return 'Enter a valid email address.'
    }

    return ''
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      showError(validationError)
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      const updatedProfile = await updateCurrentUserProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
      })
      updateCurrentUser({
        id: updatedProfile.id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        role: updatedProfile.role,
      })
      setFormData({
        name: updatedProfile.name,
        email: updatedProfile.email,
      })
      showSuccess('Profile updated.')
    } catch (requestError) {
      const message = getApiErrorMessage(requestError)
      setError(message)
      showError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleConfirmDelete() {
    setIsDeleting(true)
    let wasDeleted = false

    try {
      await deleteCurrentUserProfile()
      showSuccess('Profile deleted.')
      wasDeleted = true
    } catch (requestError) {
      showError(getApiErrorMessage(requestError))
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }

    if (wasDeleted) {
      logout()
      navigate('/login', { replace: true })
    }
  }

  return (
    <section className="grid gap-6">
      <header className="grid gap-2">
        <p className="m-0 text-[0.82rem] font-extrabold uppercase tracking-[0.08em] text-blue-600">
          Account
        </p>
        <h1 className="m-0 text-3xl font-bold leading-tight text-slate-900">
          Profile
        </h1>
        <p className="m-0 max-w-2xl text-slate-500">
          Manage your TravelPlanner account details.
        </p>
      </header>

      {isLoading ? <LoadingSpinner label="Loading profile..." /> : null}

      {!isLoading && hasLoadedProfile ? (
        <div className="grid max-w-3xl gap-6">
          <Card className="p-5 md:p-6">
            <form className="grid gap-4" onSubmit={handleSubmit}>
              {error ? <ErrorAlert message={error} /> : null}

              <Input
                autoComplete="name"
                disabled={isSubmitting || isDeleting}
                label="Name"
                maxLength={200}
                name="name"
                onChange={handleChange}
                required
                value={formData.name}
              />

              <Input
                autoComplete="email"
                disabled={isSubmitting || isDeleting}
                label="Email"
                maxLength={320}
                name="email"
                onChange={handleChange}
                required
                type="email"
                value={formData.email}
              />

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  disabled={isSubmitting || isDeleting}
                  onClick={loadProfile}
                  variant="secondary"
                >
                  Reset
                </Button>
                <Button
                  isLoading={isSubmitting}
                  type="submit"
                  variant="primary"
                >
                  Save changes
                </Button>
              </div>
            </form>
          </Card>

          <Card className="border-red-200 p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="grid gap-1">
                <h2 className="m-0 text-xl font-bold text-slate-900">
                  Delete profile
                </h2>
                <p className="m-0 text-slate-500">
                  Permanently delete your account and travel data.
                </p>
              </div>
              <Button
                disabled={isSubmitting}
                onClick={() => setIsDeleteDialogOpen(true)}
                variant="danger"
              >
                Delete profile
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {!isLoading && !hasLoadedProfile && error ? (
        <div className="grid max-w-3xl gap-4">
          <ErrorAlert message={error} />
          <div>
            <Button onClick={loadProfile} variant="secondary">
              Try again
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        confirmLabel="Delete profile"
        isOpen={isDeleteDialogOpen}
        isSubmitting={isDeleting}
        message="Delete your profile? This cannot be undone."
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete profile"
      />
    </section>
  )
}

export default ProfilePage
