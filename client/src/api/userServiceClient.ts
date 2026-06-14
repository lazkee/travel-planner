import axios from 'axios'
import {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
} from '../features/auth/types/auth.types'

const userServiceBaseUrl = import.meta.env.VITE_USER_SERVICE_URL
const AUTH_LOGOUT_EVENT = 'auth:logout'

const userServiceClient = axios.create({
  baseURL: userServiceBaseUrl,
})

userServiceClient.interceptors.request.use((config) => {
  const token =
    typeof window === 'undefined'
      ? null
      : window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

userServiceClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
      window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT))
    }

    return Promise.reject(error)
  },
)

export default userServiceClient
