import axios from "axios"

const BASE_URL = import.meta.env.VITE_BACKEND_URL

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Bypass-Tunnel-Reminder": "true"
  },
  withCredentials: true,
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Removed automatic redirect to /login because the route doesn't exist,
    // and it breaks the app on load for unauthenticated users.
    return Promise.reject(error)
  },
)

export default axiosInstance
