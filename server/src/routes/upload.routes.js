import express from 'express'
import {
    uploadImage, uploadFile,
    uploadAvatar, deleteFile
} from '../controllers/upload.controller.js'
import {
    uploadImage as uploadImageMiddleware,
    uploadFile as uploadFileMiddleware,
    uploadAvatar as uploadAvatarMiddleware
} from '../middleware/upload.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

router.post('/image', uploadImageMiddleware.single('image'), uploadImage)
router.post('/file', uploadFileMiddleware.single('file'), uploadFile)
router.post('/avatar', uploadAvatarMiddleware.single('avatar'), uploadAvatar)
router.delete('/', deleteFile)

export default router