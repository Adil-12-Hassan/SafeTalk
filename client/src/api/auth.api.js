import api from './axios'

export const signup = (name, email) => api.post('/auth/signup', { name, email })
export const requestOTP = (email) => api.post('/auth/request-otp', { email })
export const verifyOTP = (email, otp) => api.post('/auth/verify-otp', { email, otp })
export const logout = () => api.post('/auth/logout')
export const getMe = () => api.get('/auth/me')