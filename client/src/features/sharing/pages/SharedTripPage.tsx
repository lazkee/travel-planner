import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import SharedTripDetailsView from '../components/SharedTripDetailsView'
import { getSharedTravelPlan } from '../api/sharedPlan.api'
import type { SharedTravelPlanDto } from '../types/sharedPlan.types'

function getSharedPageErrorMessage(error: unknown) {
  const fallbackMessage = getApiErrorMessage(error)

  return fallbackMessage === 'Something went wrong.'
    ? 'Unable to load the shared trip. Please try again later.'
    : fallbackMessage
}

function SharedTripPage() {
  const { token } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [sharedPlan, setSharedPlan] = useState<SharedTravelPlanDto | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadSharedPlan = useCallback(
    async (showLoading = true) => {
      if (!token) {
        setSharedPlan(null)
        setError('Share token is missing.')
        setIsLoading(false)
        return
      }

      if (showLoading) {
        setIsLoading(true)
      }
      setError('')

      try {
        const nextSharedPlan = await getSharedTravelPlan(token)
        setSharedPlan(nextSharedPlan)
      } catch (requestError) {
        setSharedPlan(null)
        setError(getSharedPageErrorMessage(requestError))
      } finally {
        if (showLoading) {
          setIsLoading(false)
        }
      }
    },
    [token],
  )

  useEffect(() => {
    void loadSharedPlan()
  }, [loadSharedPlan])

  async function handleReload() {
    await loadSharedPlan(false)
  }

  function handleBackToShared() {
    navigate(
      location.pathname.startsWith('/app/shared') ? '/app/shared' : '/shared',
    )
  }

  return (
    <section className="grid gap-6">
      {isLoading ? <LoadingSpinner label="Loading shared trip..." /> : null}

      {!isLoading && error ? (
        <Card className="grid gap-4 p-5">
          <ErrorAlert message={error} />
          {token ? (
            <div>
              <Button onClick={() => void loadSharedPlan()} variant="secondary">
                Try again
              </Button>
            </div>
          ) : null}
        </Card>
      ) : null}

      {!isLoading && !error && sharedPlan && token ? (
        <SharedTripDetailsView
          backButtonLabel="Back to shared"
          onBack={handleBackToShared}
          onReload={handleReload}
          sharedPlan={sharedPlan}
          showBackButton
          token={token}
        />
      ) : null}
    </section>
  )
}

export default SharedTripPage
