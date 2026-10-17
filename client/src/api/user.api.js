import api from './axios'

export const getOnlineUsers = () => api.get('/users/online')
export const searchUsers = (query) => api.get('/users/search', { params: { q: query } })
export const getUser = (id) => api.get(`/users/${id}`)
// Admin-only: update any user (uses /admin/users/:id route)
export const adminUpdateUser = (id, data) => api.put(`/admin/users/${id}`, data)
export const updateMyProfile = (data) => api.put('/users/profile', data)