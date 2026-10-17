import { create } from 'zustand'

const useChatStore = create((set) => ({
    conversations: [],
    activeConversation: null,
    messages: [],
    hasMore: false,
    nextCursor: null,
    onlineUsers: [],
    typingUsers: {},

    // Conversations
    setConversations: (conversations) => set({ conversations }),

    updateConversationLastMessage: (conversationId, message) => set((state) => ({
        conversations: state.conversations
            .map(c => c._id === conversationId
                ? { ...c, lastMessage: message, lastMessageAt: message.createdAt }
                : c
            )
            .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
    })),

    setActiveConversation: (conversation) => set({
        activeConversation: conversation,
        messages: [],
        hasMore: false,
        nextCursor: null
    }),

    // Messages
    setMessages: (messages, hasMore, nextCursor) => set({ messages, hasMore, nextCursor }),

    prependMessages: (older, hasMore, nextCursor) => set((state) => ({
        messages: [...older, ...state.messages],
        hasMore,
        nextCursor
    })),

    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),

    removeMessage: (messageId) => set((state) => ({
        messages: state.messages.filter(m => m._id !== messageId)
    })),

    updateMessageStatus: (messageId, field, userIds) => set((state) => ({
        messages: state.messages.map(m =>
            m._id === messageId ? { ...m, [field]: userIds } : m
        )
    })),

    // Online users
    setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
    addOnlineUser: (userId) => set((state) => ({
        onlineUsers: [...new Set([...state.onlineUsers, userId])]
    })),
    removeOnlineUser: (userId) => set((state) => ({
        onlineUsers: state.onlineUsers.filter(id => id !== userId)
    })),

    // Typing
    setTyping: (conversationId, userId, userName) => set((state) => ({
        typingUsers: {
            ...state.typingUsers,
            [conversationId]: { userId, userName }
        }
    })),
    clearTyping: (conversationId) => set((state) => {
        const updated = { ...state.typingUsers }
        delete updated[conversationId]
        return { typingUsers: updated }
    })
}))

export default useChatStore