import Message from '../models/Message.js'
import Conversation from '../models/Conversation.js'
import { redis } from '../config/redis.js'

const MESSAGES_CACHE_TTL = 60 * 30 // 30 minutes
const MESSAGES_LIMIT = 30

// Send message
export const sendMessage = async (req, res) => {
    try {
        const { conversationId, content, type, fileUrl, fileName } = req.body
        if (!conversationId) return res.status(400).json({ message: 'Conversation required' })
        if (!content && !fileUrl) return res.status(400).json({ message: 'Content or file required' })

        // Verify user is participant
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: req.user._id
        })
        if (!conversation) return res.status(403).json({ message: 'Not a participant' })

        const message = await Message.create({
            conversationId,
            sender: req.user._id,
            type: type || 'text',
            content: content || '',
            fileUrl: fileUrl || '',
            fileName: fileName || '',
            readBy: [req.user._id],
            deliveredTo: [req.user._id]
        })

        await message.populate('sender', 'name avatar')

        // Update conversation lastMessage
        conversation.lastMessage = message._id
        conversation.lastMessageAt = new Date()
        await conversation.save()

        // Invalidate caches
        await redis.del(`messages:${conversationId}:1`)
        await Promise.all(
            conversation.participants.map(id => redis.del(`conversations:${id}`))
        )

        res.status(201).json({ message })
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
}

// Get messages (cursor-based pagination)
export const getMessages = async (req, res) => {
    try {
        const { id: conversationId } = req.params
        const { cursor, page = 1 } = req.query

        // Verify participant
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: req.user._id
        })
        if (!conversation) return res.status(403).json({ message: 'Not a participant' })

        // Only cache first page
        if (!cursor) {
            const cacheKey = `messages:${conversationId}:1`
            const cached = await redis.get(cacheKey)
            if (cached) return res.json({ ...JSON.parse(cached), fromCache: true })
        }

        const query = { conversationId }
        if (cursor) query._id = { $lt: cursor } // Load older messages

        const messages = await Message.find(query)
            .populate('sender', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(MESSAGES_LIMIT)

        const hasMore = messages.length === MESSAGES_LIMIT
        const nextCursor = hasMore ? messages[messages.length - 1]._id : null

        const result = {
            messages: messages.reverse(), // Oldest first for UI
            hasMore,
            nextCursor
        }

        // Cache first page only
        if (!cursor) {
            await redis.setex(
                `messages:${conversationId}:1`,
                MESSAGES_CACHE_TTL,
                JSON.stringify(result)
            )
        }

        res.json(result)
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
}

// Mark messages as read
export const markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.body

        await Message.updateMany(
            {
                conversationId,
                readBy: { $ne: req.user._id }
            },
            { $addToSet: { readBy: req.user._id } }
        )

        // Invalidate message cache
        await redis.del(`messages:${conversationId}:1`)

        res.json({ message: 'Marked as read' })
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
}

// Delete message (only sender)
export const deleteMessage = async (req, res) => {
    try {
        const message = await Message.findOne({
            _id: req.params.id,
            sender: req.user._id
        })
        if (!message) return res.status(404).json({ message: 'Message not found' })

        await message.deleteOne()

        // Invalidate cache
        await redis.del(`messages:${message.conversationId}:1`)

        res.json({ message: 'Message deleted' })
    } catch {
        res.status(500).json({ message: 'Server error' })
    }
}