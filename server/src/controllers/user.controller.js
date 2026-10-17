import User from '../models/User.js'
import { redis } from '../config/redis.js'

const ONLINE_USERS_KEY = 'online_users'

// Get my profile
export const getProfile = async (req, res) => {
    try {
        res.json({ user: req.user })
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
}

// Update my profile
export const updateProfile = async (req, res) => {
    try {
        const { name, avatar } = req.body
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, avatar },
            { new: true, runValidators: true }
        ).select('-otp -otpExpiry')

        res.json({ user })
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
}

// Search users by name or email
export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query
        if (!q) return res.status(400).json({ message: 'Query required' })

        const users = await User.find({
            _id: { $ne: req.user._id },
            isActive: true,
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        })
            .select('name email avatar lastSeen')
            .limit(10)

        res.json({ users })
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
}

// Get online users (Redis)
export const getOnlineUsers = async (req, res) => {
    try {
        const onlineMap = await redis.hgetall(ONLINE_USERS_KEY)
        const onlineUserIds = onlineMap ? Object.keys(onlineMap) : []
        res.json({ onlineUsers: onlineUserIds })
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
}

// Get user by id
export const getUserById = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.params.id,
            isActive: true
        }).select('name email avatar lastSeen')

        if (!user) return res.status(404).json({ message: 'User not found' })

        // Check online status from Redis
        const socketId = await redis.hget(ONLINE_USERS_KEY, req.params.id)
        res.json({ user, isOnline: !!socketId })
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
}