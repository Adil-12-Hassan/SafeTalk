import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token
        if (!token)
            return res.status(401).json({
                message: "Unauthorized"
            });
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decode.userId).select('-otp -otpExpiry')
        if (!req.user)
            return res.status(401).json({
                message: "User not found"
            })
        next()
    } catch {
        res.status(401).json({
            message: "Invalid token"
        })
    }
}

const adminOnly = (req, res, next) => {
    if (!req.user?.isAdmin)
        return res.status(403).json({
            message: "Forbidden! Authorized Person Only."
        })
    next()
}
export { protect, adminOnly }