import { Navigate, Route, Routes } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout'
import AppLayout from '../components/layout/AppLayout'
import { useAuth } from '../context/AuthContext'
import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import MyTripsPage from '../features/trips/pages/MyTripsPage'
import ProtectedRoute from './ProtectedRoute'

function DefaultRedirect() {
  const { isAuthenticated } = useAuth()

  return <Navigate to={isAuthenticated ? '/app/trips' : '/login'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DefaultRedirect />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/app/trips" replace />} />
          <Route path="trips" element={<MyTripsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  )
}

export default AppRoutes
