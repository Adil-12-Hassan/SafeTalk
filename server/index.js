import 'dotenv/config'
import express from 'express'
import http from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import connectDB from './src/config/db.js'
import connectRedis from './src/config/redis.js'
import { initSocket } from './src/socket/socket.js'
import authRoutes from './src/routes/auth.routes.js'
import adminRoutes from './src/routes/admin.routes.js'
import conversationRoutes from './src/routes/conversation.routes.js'
import messageRoutes from './src/routes/message.routes.js'
import userRoutes from './src/routes/user.routes.js'
import uploadRoutes from './src/routes/upload.routes.js'

const app = express()
const clientOrigin = process.env.CLIENT_URL?.trim().replace(/\/+$/, '')

app.use(cors({ origin: clientOrigin, credentials: true }))
app.use(express.json())
app.use(cookieParser())

connectRedis();

app.get('/', (req, res) => res.json({ message: 'SafeTalk API running' }))
app.use('/api', async (req, res, next) => {
    try {
        await connectDB()
        next()
    } catch (err) {
        console.error('Database connection failed:', err)
        res.status(503).json({ message: 'Database unavailable' })
    }
})

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/users', userRoutes)
app.use('/api/upload', uploadRoutes)

if (process.env.VERCEL !== '1') {
    const server = http.createServer(app)
    initSocket(server, clientOrigin)

    const PORT = process.env.PORT || 5000
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
    connectDB().catch(err => {
        console.error('Database connection failed:', err)
        process.exit(1)
    })
}

export default app