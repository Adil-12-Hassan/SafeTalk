import dotenv from 'dotenv'
import express from 'express'
import http from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'

dotenv.config()

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
const server = http.createServer(app)

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())

connectDB()
connectRedis()
initSocket(server)

app.get('/', (req, res) => res.json({ message: 'SafeTalk API running' }))
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/users', userRoutes)
app.use('/api/upload', uploadRoutes)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))