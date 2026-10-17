import multer from "multer";
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.js'

const imageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'safetalk/images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }]
    }
})

const fileStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'safetalk/files',
        allowed_formats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip'],
        resource_type: 'raw'
    }
})

const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'safetalk/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 300, height: 300, crop: 'fill', quality: 'auto' }]
    }
})

const limits = { fileSize: 10 * 1024 * 1024 }
const avatarTypes = ['image/jpeg', 'image/png', 'image/webp']
const avatarLimits = { fileSize: 200 * 1024 }
const avatarFileFilter = (_req, file, callback) => {
    callback(null, avatarTypes.includes(file.mimetype))
}
export const uploadImage = multer({ storage: imageStorage, limits })
export const uploadFile = multer({ storage: fileStorage, limits })
export const uploadAvatar = multer({ storage: avatarStorage, limits: avatarLimits, fileFilter: avatarFileFilter })