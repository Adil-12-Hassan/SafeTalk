/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect } from 'react'
import { getMe } from '../api/auth.api'
import useAuthStore from '../store/authStore'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const { setUser, clearUser } = useAuthStore()

    useEffect(() => {
        const loadUser = async () => {
            try {
                const { data } = await getMe()
                setUser(data.user)
            } catch {
                clearUser()
            }
        }
        loadUser()
    }, [clearUser, setUser])

    return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)