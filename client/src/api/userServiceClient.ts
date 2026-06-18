import createServiceClient from './createServiceClient'

export default createServiceClient(import.meta.env.VITE_USER_SERVICE_URL)
