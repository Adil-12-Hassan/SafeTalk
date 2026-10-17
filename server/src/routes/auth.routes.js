import express from 'express'
import { signup, requestOTP, verifyOTP, logout, getMe } from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.js'

const router = express.Router();
router.post('/signup', signup)
router.post('/request-otp', requestOTP)
router.post('/verify-otp', verifyOTP)
router.post('/logout', protect, logout)
router.get('/me', protect, getMe)

export default router;