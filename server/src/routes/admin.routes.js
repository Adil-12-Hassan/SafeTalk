import express from 'express'
import {
    createUser, getAllUsers,
    toggleUserStatus, deleteUser, updateUser
} from '../controllers/admin.controller.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.use(protect, adminOnly) // All admin routes protected

router.post('/users', createUser)
router.get('/users', getAllUsers)
router.put('/users/:id', updateUser)
router.patch('/users/:id/toggle', toggleUserStatus)
router.delete('/users/:id', deleteUser)

export default router