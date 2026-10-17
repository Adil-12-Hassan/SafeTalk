import User from "../models/User.js";
import { generateOTP, otpExpiry } from "../utils/otp.js"
import { sendOTPEmail } from "../utils/email.js"
import { generateToken, setTokenCookie } from "../utils/jwt.js";

export const signup = async (req, res) => {
    try {
        const name = req.body.name?.trim()
        const email = req.body.email?.trim().toLowerCase()

        if (!name || !email)
            return res.status(400).json({ message: 'Name and email required.' })

        const existingUser = await User.findOne({ email })
        if (existingUser)
            return res.status(409).json({ message: 'An account with this email already exists.' })

        const user = await User.create({ name, email, isAdmin: false })
        res.status(201).json({
            message: 'Account created. You can now request a sign-in code.',
            user: { _id: user._id, name: user.name, email: user.email }
        })
    } catch (err) {
        if (err.code === 11000)
            return res.status(409).json({ message: 'An account with this email already exists.' })

        res.status(500).json({ message: 'Server error' })
    }
}

// Request OTP
export const requestOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({
                message: "Email required."
            });
        const user = await User.findOne({ email, isActive: true })
        if (!user)
            return res.status(404).json({
                message: "User not found."
            });

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = otpExpiry()
        await user.save()

        await sendOTPEmail(email, otp)
        res.json({
            message: "OTP send to your email"
        })
    } catch (err) {
        console.error('OTP request failed:', err)
        res.status(500).json({
            message: 'Server Error'
        })
    }
}
// Verify OTP
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({
            message: "Emaill and OTP required"
        })
        const user = await User.findOne({ email, isActive: true })
        if (!user) return res.status(404).json({
            message: "User not found."
        })
        if (user.otp !== otp)
            return res.status(400).json({
                message: "Invalid OTP"
            })
        if (user.otpExpiry < Date.now())
            return res.status(400).json({
                message: "OTP expired"
            })
        // Clear OTP
        user.otp = undefined
        user.otpExpiry = undefined
        await user.save()

        const token = generateToken(user._id)
        setTokenCookie(res, token)
        res.json({
            message: "Login Successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                isAdmin: user.isAdmin,
                isActive: user.isActive,
                lastSeen: user.lastSeen
            }
        })
    } catch {
        res.status(500).json({
            message: "Server error"
        })
    }
}
// Logout
export const logout = (req, res) => {
    res.clearCookie('token')
    res.json({ message: "Logged Out" })
}
export const getMe = async (req, res) => {
    res.json({ user: req.user })
}