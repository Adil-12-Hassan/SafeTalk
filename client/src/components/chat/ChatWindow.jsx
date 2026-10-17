import { useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { getMessages, deleteMessage } from '../../api/message.api'
import useChatStore from '../../store/chatStore'
import useAuthStore from '../../store/authStore'
import useSocket from '../../hooks/useSocket'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import TypingIndicator from './TypingIndicator'
import Avatar from '../shared/Avatar'
import { formatLastSeen } from '../../utils/formatTime'
import toast from 'react-hot-toast'

const ChatWindow = ({ onBack }) => {
    const {
        activeConversation, messages, hasMore, nextCursor,
        setMessages, prependMessages, removeMessage,
        onlineUsers, typingUsers
    } = useChatStore()
    const { user } = useAuthStore()
    const { joinRoom, markRead } = useSocket()
    const messagesContainerRef = useRef(null)
    const topRef = useRef(null)
    const loadingRef = useRef(false)
    const pendingPrependScrollRef = useRef(null)
    const initialScrollConversationRef = useRef(null)
    const shouldStickToBottomRef = useRef(true)
    const conversationId = activeConversation?._id

    const isGroup = activeConversation?.type === 'group'
    const other = !isGroup
        ? activeConversation?.participants?.find(p => p._id !== user?._id)
        : null
    const name = isGroup ? activeConversation?.groupName : other?.name
    const avatar = isGroup ? activeConversation?.groupAvatar : other?.avatar
    const isOnline = !isGroup && onlineUsers.includes(other?._id)
    const typing = typingUsers[activeConversation?._id]

    // Load messages
    const loadMessages = useCallback(async (cursor = null) => {
        if (!conversationId || loadingRef.current) return
        const container = messagesContainerRef.current
        loadingRef.current = true
        try {
            const { data } = await getMessages(conversationId, cursor)
            if (cursor) {
                pendingPrependScrollRef.current = {
                    conversationId,
                    scrollHeight: container?.scrollHeight ?? 0,
                    scrollTop: container?.scrollTop ?? 0
                }
                prependMessages(data.messages, data.hasMore, data.nextCursor)
            } else {
                initialScrollConversationRef.current = conversationId
                setMessages(data.messages, data.hasMore, data.nextCursor)
            }
        } catch {
            toast.error('Failed to load messages')
        } finally {
            loadingRef.current = false
        }
    }, [conversationId, prependMessages, setMessages])

    useEffect(() => {
        if (!conversationId) return
        loadMessages()
        joinRoom(conversationId)
        markRead(conversationId)
    }, [conversationId, joinRoom, loadMessages, markRead])

    useLayoutEffect(() => {
        const container = messagesContainerRef.current
        if (!container) return

        if (pendingPrependScrollRef.current?.conversationId === conversationId) {
            const { scrollHeight, scrollTop } = pendingPrependScrollRef.current
            container.scrollTop = scrollTop + container.scrollHeight - scrollHeight
            pendingPrependScrollRef.current = null
            return
        }

        if (initialScrollConversationRef.current === conversationId) {
            container.scrollTop = container.scrollHeight
            initialScrollConversationRef.current = null
            shouldStickToBottomRef.current = true
            return
        }

        if (shouldStickToBottomRef.current) {
            container.scrollTop = container.scrollHeight
        }
    }, [conversationId, messages])

    useEffect(() => {
        const container = messagesContainerRef.current
        if (!container) return

        const updateScrollPosition = () => {
            const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
            shouldStickToBottomRef.current = distanceFromBottom < 120
        }

        container.addEventListener('scroll', updateScrollPosition, { passive: true })
        return () => container.removeEventListener('scroll', updateScrollPosition)
    }, [conversationId])

    // Infinite scroll
    useEffect(() => {
        const container = messagesContainerRef.current
        if (!container || !topRef.current) return

        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting && hasMore) loadMessages(nextCursor) },
            { root: container, threshold: 0.1 }
        )
        observer.observe(topRef.current)
        return () => observer.disconnect()
    }, [conversationId, hasMore, nextCursor, loadMessages])

    const handleDelete = async (messageId) => {
        try {
            await deleteMessage(messageId)
            removeMessage(messageId)
        } catch {
            toast.error('Failed to delete message')
        }
    }

    if (!activeConversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-dark-bg">
                <div className="text-center">
                    <div className="w-20 h-20 bg-dark-sidebar rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                        </svg>
                    </div>
                    <p className="text-gray-400">Select a conversation to start chatting</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-dark-bg">

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-dark-sidebar border-b border-dark-border">
                <button
                    type="button"
                    onClick={onBack}
                    className="md:hidden shrink-0 text-gray-400 hover:text-white"
                    aria-label="Back to conversations"
                >
                    ←
                </button>
                <Avatar src={avatar} name={name} size="md" online={isOnline} />
                <div>
                    <p className="text-white font-semibold text-sm">{name}</p>
                    <p className="text-gray-400 text-xs">
                        {isGroup
                            ? `${activeConversation.participants?.length} members`
                            : isOnline ? 'Online' : formatLastSeen(other?.lastSeen)
                        }
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="min-h-0 flex-1 overflow-y-auto py-2">
                <div ref={topRef} className="h-1" />
                {hasMore && (
                    <p className="text-center text-gray-400 text-xs py-2">Loading older messages...</p>
                )}
                {messages.map(message => (
                    <MessageBubble
                        key={message._id}
                        message={message}
                        onDelete={handleDelete}
                    />
                ))}
                {typing && <TypingIndicator userName={typing.userName} />}
            </div>

            {/* Input */}
            <MessageInput conversationId={activeConversation._id} />
        </div>
    )
}

export default ChatWindow