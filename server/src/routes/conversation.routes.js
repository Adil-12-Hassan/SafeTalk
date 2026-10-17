import express from 'express'
import {
    getOrCreateDirect, createGroup, getMyConversations,
    getConversation, updateGroup, addParticipant, removeParticipant
} from '../controllers/conversation.controller.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

router.get('/', getMyConversations)
router.get('/:id', getConversation)
router.post('/direct', getOrCreateDirect)
router.post('/group', createGroup)
router.put('/group/:id', updateGroup)
router.patch('/group/:id/add', addParticipant)
router.patch('/group/:id/remove', removeParticipant)

export default router