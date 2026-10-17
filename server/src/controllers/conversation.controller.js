import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import { redis } from '../config/redis.js'

const CACHE_TTL = 60 * 15 // 15 minutes

// Create or get direct conversation
export const getOrCreateDirect = async (req, res) => {
    try {
        const { targetUserId } = req.body
        if (!targetUserId) return res.status(400).json({ message: 'Target user required' })

        // Check existing
        let conversation = await Conversation.findOne({
            type: 'direct',
            participants: { $all: [req.user._id, targetUserId], $size: 2 }
        }).populate('participants', 'name avatar lastSeen')
            .populate('lastMessage')

        if (!conversation) {
            conversation = await Conversation.create({
                type: 'direct',
                participants: [req.user._id, targetUserId],
                createdBy: req.user._id
            })
            await conversation.populate('participants', 'name avatar lastSeen')
        }

        // Invalidate user's conversation cache
        await redis.del(`conversations:${req.user._id}`)

        res.json({ conversation })
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
}

// Create group
export const createGroup = async (req, res) => {
    try {
        const { groupName, participants } = req.body
        if (!groupName || !participants?.length) {
            return res.status(400).json({ message: 'Group name and participants required' })
        }

        // Always include creator
        const allParticipants = [...new Set([...participants, req.user._id.toString()])]

        const conversation = await Conversation.create({
            type: 'group',
            groupName,
            participants: allParticipants,
            createdBy: req.user._id
        })

        await conversation.populate('participants', 'name avatar')

        // Invalidate cache for all participants
        await Promise.all(
            allParticipants.map(id => redis.del(`conversations:${id}`))
        )

        res.status(201).json({ conversation })
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
}

// Get all conversations for current user
export const getMyConversations = async (req, res) => {
    try {
        const cacheKey = `conversations:${req.user._id}`

        // Check Redis cache
        const cached = await redis.get(cacheKey)
        if (cached) return res.json({ conversations: JSON.parse(cached), fromCache: true })

        const conversations = await Conversation.find({
            participants: req.user._id
        })
            .populate('participants', 'name avatar lastSeen')
            .populate('lastMessage')
            .sort({ lastMessageAt: -1 })

        // Save to Redis
        await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(conversations))

        res.json({ conversations })
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
}

// Get single conversation
export const getConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            participants: req.user._id
        })
            .populate('participants', 'name avatar lastSeen')
            .populate('lastMessage')

        if (!conversation) return res.status(404).json({ message: 'Conversation not found' })

        res.json({ conversation })
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
}

// Update group (name or avatar)
export const updateGroup = async (req, res) => {
    try {
        const { groupName, groupAvatar } = req.body
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            type: 'group',
            participants: req.user._id
        })

        if (!conversation) return res.status(404).json({ message: 'Group not found' })

        if (groupName) conversation.groupName = groupName
        if (groupAvatar) conversation.groupAvatar = groupAvatar
        await conversation.save()

        // Invalidate cache for all participants
        await Promise.all(
            conversation.participants.map(id => redis.del(`conversations:${id}`))
        )

        res.json({ conversation })
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
}

// Add participant to group
export const addParticipant = async (req, res) => {
    try {
        const { userId } = req.body
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            type: 'group',
            createdBy: req.user._id
        })

        if (!conversation) return res.status(404).json({ message: 'Group not found or not admin' })
        if (conversation.participants.includes(userId)) {
            return res.status(400).json({ message: 'User already in group' })
        }

        conversation.participants.push(userId)
        await conversation.save()
        await redis.del(`conversations:${userId}`)

        res.json({ message: 'Participant added', conversation })
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
}

// Remove participant from group
export const removeParticipant = async (req, res) => {
    try {
        const { userId } = req.body
        const conversation = await Conversation.findOne({
            _id: req.params.id,
            type: 'group',
            createdBy: req.user._id
        })

        if (!conversation) return res.status(404).json({ message: 'Group not found or not admin' })

        conversation.participants = conversation.participants.filter(
            p => p.toString() !== userId
        )
        await conversation.save()
        await redis.del(`conversations:${userId}`)

        res.json({ message: 'Participant removed', conversation })
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
}