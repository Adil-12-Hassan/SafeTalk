import Message from '../models/Message.js'
import Conversation from '../models/Conversation.js'

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

        res.status(201).json({ message })
    } catch (err) {
        console.error('sendMessage error:', err)
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

        res.json(result)
    } catch (err) {
        console.error('getMessages error:', err)
        res.status(500).json({ message: 'Server error' })
    }
}

// Mark messages as read
export const markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.body

        // Verify user is a participant before marking as read
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: req.user._id
        })
        if (!conversation) return res.status(403).json({ message: 'Not a participant' })

        await Message.updateMany(
            {
                conversationId,
                readBy: { $ne: req.user._id }
            },
            { $addToSet: { readBy: req.user._id } }
        )

        res.json({ message: 'Marked as read' })
    } catch (err) {
        console.error('markAsRead error:', err)
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

        res.json({ message: 'Message deleted' })
    } catch (err) {
        console.error('deleteMessage error:', err)
        res.status(500).json({ message: 'Server error' })
    }
}