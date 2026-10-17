import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema({
    type: { type: String, enum: ['direct', 'group'], required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    groupName: { type: String, default: '' },
    groupAvatar: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
    lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true })

export default mongoose.model('Conversation', conversationSchema)