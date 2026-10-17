import express from 'express'
import {
    getProfile, updateProfile,
    searchUsers, getOnlineUsers, getUserById
} from '../controllers/user.controller.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.get('/search', searchUsers)
router.get('/online', getOnlineUsers)
router.get('/:id', getUserById)

export default router