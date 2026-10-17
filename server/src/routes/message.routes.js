import express from 'express'
import {
    sendMessage, getMessages,
    markAsRead, deleteMessage
} from '../controllers/message.controller.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

router.post('/', sendMessage)
router.get('/:id', getMessages)
router.post('/read', markAsRead)
router.delete('/:id', deleteMessage)

export default router