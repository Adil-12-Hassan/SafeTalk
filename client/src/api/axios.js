import axios from 'axios'
import useAuthStore from '../store/authStore'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
})

api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            useAuthStore.getState().clearUser()
        }
        return Promise.reject(err)
    }
)

export default api