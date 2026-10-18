import User from '../models/User.js'

// Create user
export const createUser = async (req, res) => {
    try {
        const { name, email, isAdmin } = req.body
        if (!name || !email) return res.status(400).json({ message: 'Name and email required' })

        const exists = await User.findOne({ email })
        if (exists) return res.status(400).json({ message: 'User already exists' })

        const user = await User.create({ name, email, isAdmin: isAdmin || false })
        res.status(201).json({ message: 'User created', user })
    } catch (err) {
        console.error('createUser error:', err)
        res.status(500).json({ message: 'Server error' })
    }
}

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-otp -otpExpiry').sort({ createdAt: -1 })
        res.json({ users })
    } catch (err) {
        console.error('getAllUsers error:', err)
        res.status(500).json({ message: 'Server error' })
    }
}

// Toggle user active status
export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).json({ message: 'User not found' })

        user.isActive = !user.isActive
        await user.save()
        res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user })
    } catch (err) {
        console.error('toggleUserStatus error:', err)
        res.status(500).json({ message: 'Server error' })
    }
}

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).json({ message: 'User not found' })
        if (user._id.equals(req.user._id)) return res.status(400).json({ message: 'Cannot delete yourself' })

        await user.deleteOne()
        res.json({ message: 'User deleted' })
    } catch (err) {
        console.error('deleteUser error:', err)
        res.status(500).json({ message: 'Server error' })
    }
}

// Update user
export const updateUser = async (req, res) => {
    try {
        const { name, email, isAdmin } = req.body
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, isAdmin },
            { new: true, runValidators: true }
        ).select('-otp -otpExpiry')

        if (!user) return res.status(404).json({ message: 'User not found' })
        res.json({ message: 'User updated', user })
    } catch (err) {
        console.error('updateUser error:', err)
        res.status(500).json({ message: 'Server error' })
    }
}