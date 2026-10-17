import cloudinary from '../config/cloudinary.js'

// Upload image
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
        res.json({
            url: req.file.path,
            publicId: req.file.filename,
            type: 'image'
        })
    } catch {
        res.status(500).json({ message: 'Upload failed' })
    }
}

// Upload file
export const uploadFile = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
        res.json({
            url: req.file.path,
            publicId: req.file.filename,
            fileName: req.file.originalname,
            type: 'file'
        })
    } catch {
        res.status(500).json({ message: 'Upload failed' })
    }
}

// Upload avatar
export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Choose a JPEG, PNG, or WebP profile image' })
        res.json({
            url: req.file.path,
            publicId: req.file.filename
        })
    } catch {
        res.status(500).json({ message: 'Upload failed' })
    }
}

// Delete file from Cloudinary
export const deleteFile = async (req, res) => {
    try {
        const { publicId, resourceType } = req.body
        if (!publicId) return res.status(400).json({ message: 'PublicId required' })

        await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType || 'image'
        })

        res.json({ message: 'File deleted' })
    } catch {
        res.status(500).json({ message: 'Delete failed' })
    }
}