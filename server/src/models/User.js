import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    avatar: { type: String, default: '' },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },
    otp: { type: String },
    otpExpiry: { type: Date }
}, { timestamps: true })

export default mongoose.model('User', userSchema)