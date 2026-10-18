import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Message from '../models/Message.js'
import Conversation from '../models/Conversation.js'
import { addOnlineSocket, isUserOnlineExcept, removeOnlineSocket } from '../utils/presence.js'
let io

export const initSocket = (server, clientOrigin) => {
    io = new Server(server, {
        cors: { origin: clientOrigin, credentials: true },
        pingTimeout: 60000
    })

    // Auth middleware for socket
    io.use(async (socket, next) => {
        try {
            const cookieHeader = socket.handshake.headers.cookie || ''
            const cookieToken = cookieHeader
                .split(';')
                .map(c => c.trim())
                .find(c => c.startsWith('token='))
                ?.split('=')[1]
            const token = socket.handshake.auth.token || cookieToken

            if (!token) return next(new Error('Unauthorized'))

            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const user = await User.findById(decoded.userId).select('-otp -otpExpiry')
            if (!user) return next(new Error('User not found'))

            socket.user = user
            next()
        } catch (err) {
            console.error('Socket auth error:', err.message)
            next(new Error('Invalid token'))
        }
    })

    io.on('connection', async (socket) => {
        const userId = socket.user._id.toString()

        // --- PRESENCE ---
        const isFirstSocket = addOnlineSocket(userId, socket.id)
        await User.findByIdAndUpdate(userId, { lastSeen: new Date() })
        if (isFirstSocket) socket.broadcast.emit('user_online', { userId })

        // Join all user's conversation rooms
        const conversations = await Conversation.find({ participants: userId })
        conversations.forEach(c => socket.join(c._id.toString()))

        // --- MESSAGING ---
        socket.on('send_message', async (data) => {
            try {
                const { conversationId, content, type, fileUrl, fileName } = data

                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: userId
                })
                if (!conversation) return

                const message = await Message.create({
                    conversationId,
                    sender: userId,
                    type: type || 'text',
                    content: content || '',
                    fileUrl: fileUrl || '',
                    fileName: fileName || '',
                    readBy: [userId],
                    deliveredTo: [userId]
                })

                await message.populate('sender', 'name avatar')

                // Update conversation
                conversation.lastMessage = message._id
                conversation.lastMessageAt = new Date()
                await conversation.save()

                // Emit to room
                io.to(conversationId).emit('new_message', { message })

                // Mark delivered for online participants
                const deliveredTo = conversation.participants
                    .map(p => p.toString())
                    .filter(id => isUserOnlineExcept(id, userId))

                if (deliveredTo.length) {
                    await Message.findByIdAndUpdate(message._id, {
                        $addToSet: { deliveredTo: { $each: deliveredTo } }
                    })
                    io.to(conversationId).emit('message_delivered', {
                        messageId: message._id,
                        deliveredTo
                    })
                }
            } catch (err) {
                socket.emit('error', { message: 'Failed to send message' })
            }
        })

        // --- TYPING ---
        socket.on('typing_start', ({ conversationId }) => {
            socket.to(conversationId).emit('typing_start', {
                conversationId,
                userId,
                userName: socket.user.name
            })
        })

        socket.on('typing_stop', ({ conversationId }) => {
            socket.to(conversationId).emit('typing_stop', {
                conversationId,
                userId
            })
        })

        // --- READ RECEIPTS ---
        socket.on('message_read', async ({ conversationId }) => {
            await Message.updateMany(
                { conversationId, readBy: { $ne: userId } },
                { $addToSet: { readBy: userId } }
            )
            socket.to(conversationId).emit('message_read', {
                conversationId,
                userId
            })
        })

        // --- JOIN NEW ROOM ---
        socket.on('join_room', ({ conversationId }) => {
            socket.join(conversationId)
        })

        // --- DISCONNECT ---
        socket.on('disconnect', async () => {
            const isLastSocket = removeOnlineSocket(userId, socket.id)
            if (isLastSocket) {
                await User.findByIdAndUpdate(userId, { lastSeen: new Date() })
                socket.broadcast.emit('user_offline', { userId })
            }
        })
    })

    return io
}

export { io }