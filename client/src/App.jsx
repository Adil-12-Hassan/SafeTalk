import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Chat from './pages/Chat.jsx'
import Admin from './pages/Admin.jsx'
import Signup from './pages/Signup.jsx'
import useAuthStore from './store/authStore'
import Loader from './components/shared/Loader.jsx'

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuthStore()
    if (isLoading) return <Loader />
    return isAuthenticated ? children : <Navigate to="/login" />
}

const AdminRoute = ({ children }) => {
    const { user, isLoading } = useAuthStore()
    if (isLoading) return <Loader />
    return user?.isAdmin ? children : <Navigate to="/" />
}

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/" element={
                    <ProtectedRoute><Chat /></ProtectedRoute>
                } />
                <Route path="/admin" element={
                    <AdminRoute><Admin /></AdminRoute>
                } />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App