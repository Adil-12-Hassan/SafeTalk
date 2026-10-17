import api from './axios'

export const getMyConversations = () => api.get('/conversations')
export const getOrCreateDirect = (targetUserId) => api.post('/conversations/direct', { targetUserId })
export const createGroup = (groupName, participants) => api.post('/conversations/group', { groupName, participants })
export const getConversation = (id) => api.get(`/conversations/${id}`)
export const updateGroup = (id, data) => api.put(`/conversations/group/${id}`, data)
export const addParticipant = (id, userId) => api.patch(`/conversations/group/${id}/add`, { userId })
export const removeParticipant = (id, userId) => api.patch(`/conversations/group/${id}/remove`, { userId })