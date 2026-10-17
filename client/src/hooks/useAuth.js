import useAuthStore from '../store/authStore'
import { logout } from '../api/auth.api'

const useAuth = () => {
    const { user, isAuthenticated, isLoading, clearUser } = useAuthStore()

    const handleLogout = async () => {
        try {
            await logout()
        } finally {
            clearUser()
        }
    }

    return { user, isAuthenticated, isLoading, logout: handleLogout }
}

export default useAuth