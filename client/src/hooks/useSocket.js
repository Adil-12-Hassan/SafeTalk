import { useCallback } from 'react'
import { useSocketContext } from '../context/SocketContext'

const useSocket = () => {
    const { socket } = useSocketContext()

    const emit = useCallback((event, data) => {
        socket.current?.emit(event, data)
    }, [socket])

    const joinRoom = useCallback((conversationId) => {
        emit('join_room', { conversationId })
    }, [emit])

    const sendMessage = useCallback((data) => {
        emit('send_message', data)
    }, [emit])

    const startTyping = useCallback((conversationId) => {
        emit('typing_start', { conversationId })
    }, [emit])

    const stopTyping = useCallback((conversationId) => {
        emit('typing_stop', { conversationId })
    }, [emit])

    const markRead = useCallback((conversationId) => {
        emit('message_read', { conversationId })
    }, [emit])

    return { emit, joinRoom, sendMessage, startTyping, stopTyping, markRead }
}

export default useSocket