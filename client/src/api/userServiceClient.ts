import axios from 'axios'
import { AUTH_TOKEN_STORAGE_KEY } from '../features/auth/types/auth.types'

const userServiceBaseUrl = import.meta.env.VITE_USER_SERVICE_URL

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

export default userServiceClient
