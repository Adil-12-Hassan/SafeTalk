/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import useAuthStore from '../store/authStore'
import useChatStore from '../store/chatStore'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null)
    const { isAuthenticated } = useAuthStore()
    const {
        addMessage,
        updateConversationLastMessage,
        updateMessageStatus,
        addOnlineUser,
        removeOnlineUser,
        setTyping,
        clearTyping
    } = useChatStore()

    useEffect(() => {
        if (!isAuthenticated) return

        const socket = io(import.meta.env.VITE_SOCKET_URL, {
            withCredentials: true,
            auth: { token: document.cookie.split('token=')[1] }
        })

        socketRef.current = socket

        socket.on('user_online', ({ userId }) => addOnlineUser(userId))
        socket.on('user_offline', ({ userId }) => removeOnlineUser(userId))

        socket.on('new_message', ({ message }) => {
            addMessage(message)
            updateConversationLastMessage(message.conversationId, message)
        })

        socket.on('message_delivered', ({ messageId, deliveredTo }) => {
            updateMessageStatus(messageId, 'deliveredTo', deliveredTo)
        })

        socket.on('message_read', ({ conversationId, userId }) => {
            useChatStore.getState().messages.forEach(m => {
                if (m.conversationId === conversationId) {
                    updateMessageStatus(m._id, 'readBy', [...(m.readBy || []), userId])
                }
            })
        })

        socket.on('typing_start', ({ conversationId, userId, userName }) => {
            setTyping(conversationId, userId, userName)
        })

        socket.on('typing_stop', ({ conversationId }) => {
            clearTyping(conversationId)
        })

        return () => {
            socket.disconnect()
            socketRef.current = null
        }
    }, [addMessage, addOnlineUser, clearTyping, isAuthenticated, removeOnlineUser, setTyping, updateConversationLastMessage, updateMessageStatus])

    return (
        <SocketContext.Provider value={{ socket: socketRef }}>
            {children}
        </SocketContext.Provider>
    )
}

export const useSocketContext = () => useContext(SocketContext)
