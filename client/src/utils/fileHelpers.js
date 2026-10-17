import api from '../api/axios'

export const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    const { data } = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
}

export const uploadFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post('/upload/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
}

export const uploadAvatar = async (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    const { data } = await api.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
}

export const isImageFile = (file) => file.type.startsWith('image/')

export const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}