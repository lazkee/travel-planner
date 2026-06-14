import axios from 'axios'
import { AUTH_TOKEN_STORAGE_KEY } from '../features/auth/types/auth.types'

const travelServiceBaseUrl = import.meta.env.VITE_TRAVEL_SERVICE_URL

const travelServiceClient = axios.create({
  baseURL: travelServiceBaseUrl,
})

travelServiceClient.interceptors.request.use((config) => {
  const token =
    typeof window === 'undefined'
      ? null
      : window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default travelServiceClient
