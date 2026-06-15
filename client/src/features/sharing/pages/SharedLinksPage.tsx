import { useState } from 'react'
import type * as React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import Input from '../../../components/ui/Input'
import { getSharedTravelPlan } from '../api/sharedPlans.api'

type SharedLinkFormData = {
  sharedLink: string
}

type SharedLinksPageProps = {
  targetBasePath?: '/app/shared' | '/shared'
}

type SharedLinksLocationState = {
  sharedLinkError?: string
  sharedLinkValue?: string
}

const invalidSharedLinkMessage = 'Invalid shared link or token.'

function extractShareToken(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return ''
  }

  try {
    const url = new URL(trimmedValue)
    const match = url.pathname.match(/\/(?:app\/)?shared\/([^/]+)/)

    return match?.[1] ? decodeURIComponent(match[1]) : ''
  } catch {
    const match = trimmedValue.match(/(?:^|\/)(?:app\/)?shared\/([^/?#]+)/)

    if (match?.[1]) {
      return decodeURIComponent(match[1])
    }

    return trimmedValue
  }
}

function isInvalidSharedLinkError(error: unknown) {
  return error instanceof Error && error.message === 'Share link not found.'
}

function getSharedLinkPageError(error: unknown) {
  if (error instanceof Error && error.message === 'Share link expired.') {
    return error.message
  }

  return 'Unable to load the shared trip. Please try again later.'
}

function SharedLinksPage({
  targetBasePath = '/app/shared',
}: SharedLinksPageProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const locationState = (location.state ?? null) as SharedLinksLocationState | null
  const [formData, setFormData] = useState<SharedLinkFormData>({
    sharedLink: locationState?.sharedLinkValue ?? '',
  })
  const [inputError, setInputError] = useState(
    locationState?.sharedLinkError ?? '',
  )
  const [pageError, setPageError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    setInputError('')
    setPageError('')
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const token = extractShareToken(formData.sharedLink)

    if (!token.trim()) {
      setInputError('Shared link or token is required.')
      return
    }

    setInputError('')
    setPageError('')
    setIsSubmitting(true)

    try {
      await getSharedTravelPlan(token.trim())
      navigate(`${targetBasePath}/${encodeURIComponent(token.trim())}`)
    } catch (requestError) {
      if (isInvalidSharedLinkError(requestError)) {
        setInputError(invalidSharedLinkMessage)
      } else {
        setPageError(getSharedLinkPageError(requestError))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="grid gap-6">
      <header className="grid gap-2">
        <p className="m-0 text-[0.82rem] font-extrabold uppercase tracking-[0.08em] text-blue-600">
          Shared
        </p>
        <h1 className="m-0 text-3xl font-bold leading-tight text-slate-900">
          Shared trips
        </h1>
        <p className="m-0 max-w-2xl text-slate-500">
          Open a shared TravelPlanner link.
        </p>
      </header>

      <Card className="max-w-2xl p-5">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          {pageError ? <ErrorAlert message={pageError} /> : null}

          <div className="grid gap-2">
            <Input
              aria-invalid={Boolean(inputError)}
              autoComplete="off"
              label="Shared link or token"
              name="sharedLink"
              onChange={handleChange}
              placeholder="Paste a shared link or token"
              value={formData.sharedLink}
            />
            {inputError ? (
              <p className="m-0 text-sm font-semibold text-red-600">
                {inputError}
              </p>
            ) : null}
          </div>

          <div>
            <Button isLoading={isSubmitting} type="submit">
              Open shared trip
            </Button>
          </div>
        </form>
      </Card>
    </section>
  )
}

export default SharedLinksPage
