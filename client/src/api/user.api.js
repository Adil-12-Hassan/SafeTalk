import api from './axios'

export const getOnlineUsers = () => api.get('/users/online')
export const searchUsers = (query) => api.get('/users/search', { params: { q: query } })
export const getUser = (id) => api.get(`/users/${id}`)
export const updateUser = (id, data) => api.put(`/users/${id}`, data)