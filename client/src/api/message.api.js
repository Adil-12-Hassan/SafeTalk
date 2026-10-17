import api from './axios'

export const getMessages = (conversationId, cursor) =>
    api.get(`/messages/${conversationId}`, { params: { cursor } })
export const sendMessage = (data) => api.post('/messages', data)
export const markAsRead = (conversationId) => api.post('/messages/read', { conversationId })
export const deleteMessage = (id) => api.delete(`/messages/${id}`)