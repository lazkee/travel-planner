import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  login as loginRequest,
  register as registerRequest,
} from '../features/auth/api/auth.api'
import {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
  type AuthResponse,
  type AuthUser,
  type LoginRequest,
  type RegisterRequest,
  type UserRole,
} from '../features/auth/types/auth.types'
import { getJwtExpirationTime, isJwtExpired } from '../utils/jwtUtils'

type AuthContextValue = {
  token: string | null
  user: AuthUser | null
  role: UserRole | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (request: LoginRequest) => Promise<void>
  register: (request: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const AUTH_LOGOUT_EVENT = 'auth:logout'

function getStoredUser(): AuthUser | null {
  const storedValue = window.localStorage.getItem(AUTH_USER_STORAGE_KEY)

  if (!storedValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(storedValue) as Partial<AuthUser>

    if (
      typeof parsedValue.id === 'number' &&
      parsedValue.email &&
      parsedValue.name &&
      (parsedValue.role === 'User' || parsedValue.role === 'Admin')
    ) {
      return {
        id: parsedValue.id,
        name: parsedValue.name,
        email: parsedValue.email,
        role: parsedValue.role,
      }
    }
  } catch {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
  }

  return null
}

function getStoredToken() {
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

function getStoredAuth() {
  const token = getStoredToken()
  const user = getStoredUser()

  if (!token || !user || isJwtExpired(token)) {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)

    return {
      token: null,
      user: null,
    }
  }

  return {
    token,
    user,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<{
    token: string | null
    user: AuthUser | null
  }>(() => getStoredAuth())

  const persistAuth = useCallback((nextAuth: AuthResponse | null) => {
    if (nextAuth) {
      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, nextAuth.token)
      window.localStorage.setItem(
        AUTH_USER_STORAGE_KEY,
        JSON.stringify(nextAuth.user),
      )
      setAuth(nextAuth)

      return
    }

    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
    setAuth({
      token: null,
      user: null,
    })
  }, [])

  const login = useCallback(
    async (request: LoginRequest) => {
      const response = await loginRequest(request)
      persistAuth(response)
    },
    [persistAuth],
  )

  const register = useCallback(
    async (request: RegisterRequest) => {
      const response = await registerRequest(request)
      persistAuth(response)
    },
    [persistAuth],
  )

  const logout = useCallback(() => {
    persistAuth(null)
  }, [persistAuth])

  useEffect(() => {
    function handleAuthLogout() {
      logout()
    }

    window.addEventListener(AUTH_LOGOUT_EVENT, handleAuthLogout)

    return () => {
      window.removeEventListener(AUTH_LOGOUT_EVENT, handleAuthLogout)
    }
  }, [logout])

  useEffect(() => {
    if (!auth.token) {
      return
    }

    const expirationTime = getJwtExpirationTime(auth.token)

    if (!expirationTime || isJwtExpired(auth.token)) {
      logout()
      return
    }

    const timeoutId = window.setTimeout(() => {
      logout()
    }, expirationTime - Date.now())

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [auth.token, logout])

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      role: auth.user?.role ?? null,
      isAuthenticated: Boolean(auth.token && auth.user),
      isAdmin: auth.user?.role === 'Admin',
      login,
      register,
      logout,
    }),
    [auth, login, logout, register],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
