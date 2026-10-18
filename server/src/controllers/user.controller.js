import User from '../models/User.js'
import Conversation from '../models/Conversation.js'
import { redis } from '../config/redis.js'

const ONLINE_USERS_KEY = 'online_users'

// Get my profile
export const getProfile = async (req, res) => {
    try {
        res.json({ user: req.user })
    } catch (err) {
        console.error('getProfile error:', err)
        res.status(500).json({ message: 'Server error' })
    }
}

// Update my profile
export const updateProfile = async (req, res) => {
    try {
        const { name, avatar } = req.body
        const updates = {}
        if (typeof name === 'string') updates.name = name.trim()
        if (typeof avatar === 'string') updates.avatar = avatar
        if (Object.keys(updates).length === 0)
            return res.status(400).json({ message: 'No profile changes provided' })

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-otp -otpExpiry')

        const conversations = await Conversation.find({ participants: req.user._id }).select('participants')
        const cacheKeys = new Set([`conversations:${req.user._id}`])
        conversations.forEach(conversation => {
            conversation.participants.forEach(participantId => {
                cacheKeys.add(`conversations:${participantId}`)
            })
        })
        await Promise.all([...cacheKeys].map(key => redis.del(key)))

        res.json({ user })
    } catch (err) {
        console.error('updateProfile error:', err)
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
    } catch (err) {
        console.error('searchUsers error:', err)
        res.status(500).json({ message: 'Server error' })
    }
}

// Get online users (Redis)
export const getOnlineUsers = async (req, res) => {
    try {
        const onlineMap = await redis.hgetall(ONLINE_USERS_KEY)
        const onlineUserIds = onlineMap ? Object.keys(onlineMap) : []
        res.json({ onlineUsers: onlineUserIds })
    } catch (err) {
        console.error('getOnlineUsers error:', err)
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
    } catch (err) {
        console.error('getUserById error:', err)
        res.status(500).json({ message: 'Server error' })
    }
}