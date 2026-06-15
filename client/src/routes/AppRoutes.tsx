import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout'
import AppLayout from '../components/layout/AppLayout'
import { useAuth } from '../context/AuthContext'
import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import SharedLinksPage from '../features/sharing/pages/SharedLinksPage'
import SharedTripPage from '../features/sharing/pages/SharedTripPage'
import MyTripsPage from '../features/trips/pages/MyTripsPage'
import TripDetailsPage from '../features/trips/pages/TripDetailsPage'
import ProtectedRoute from './ProtectedRoute'

function DefaultRedirect() {
  const { isAuthenticated } = useAuth()

  return <Navigate to={isAuthenticated ? '/app/trips' : '/login'} replace />
}

function PublicSharedRoute() {
  const { token } = useParams()
  const { isAuthenticated } = useAuth()

  if (isAuthenticated && token) {
    return <Navigate to={`/app/shared/${encodeURIComponent(token)}`} replace />
  }

  return (
    <AppLayout variant="guest">
      <SharedTripPage />
    </AppLayout>
  )
}

function PublicSharedLinksRoute() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/app/shared" replace />
  }

  return (
    <AppLayout variant="guest">
      <SharedLinksPage targetBasePath="/shared" />
    </AppLayout>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DefaultRedirect />} />
      <Route path="/shared" element={<PublicSharedLinksRoute />} />
      <Route path="/shared/:token" element={<PublicSharedRoute />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/app/trips" replace />} />
          <Route path="trips" element={<MyTripsPage />} />
          <Route path="trips/:planId" element={<TripDetailsPage />} />
          <Route path="shared" element={<SharedLinksPage />} />
          <Route path="shared/:token" element={<SharedTripPage />} />
        </Route>
      </Route>

      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  )
}

export default AppRoutes
