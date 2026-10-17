import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyConversations } from '../../api/conversation.api'
import { getOnlineUsers } from '../../api/user.api'
import useChatStore from '../../store/chatStore'
import useAuthStore from '../../store/authStore'
import useAuth from '../../hooks/useAuth'
import useUIStore from '../../store/uiStore'
import ConversationItem from './ConversationItem'
import SearchBar from './SearchBar'
import Avatar from '../shared/Avatar'
import Modal from '../shared/Modal'
import GroupModal from '../chat/GroupModal'
import toast from 'react-hot-toast'
import { uploadAvatar } from '../../utils/fileHelpers'
import { updateMyProfile } from '../../api/user.api'

const Sidebar = () => {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const { conversations, setConversations, activeConversation,
        setActiveConversation, setOnlineUsers, restoreActiveConversation } = useChatStore()
    const { user, setUser } = useAuthStore()
    const {
        showNewChat,
        toggleNewChat,
        toggleGroupModal,
        showGroupModal,
        setMobileChatOpen
    } = useUIStore()
    const [loading, setLoading] = useState(true)
    const [avatarUploading, setAvatarUploading] = useState(false)
    const avatarInputRef = useRef(null)

    const handleLogout = async () => {
        try {
            await logout()
            toast.success('Logged out successfully')
        } catch {
            toast.error('Could not reach the server. You have been signed out locally.')
        } finally {
            useChatStore.getState().setActiveConversation(null, user?._id)
            setConversations([])
            navigate('/login')
        }
    }

    const handleAvatarChange = async (event) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            toast.error('Choose a JPEG, PNG, or WebP image')
            return
        }
        if (file.size > 200 * 1024) {
            toast.error('Profile images must be 200 KB or smaller')
            return
        }

        setAvatarUploading(true)
        try {
            const uploaded = await uploadAvatar(file)
            const { data } = await updateMyProfile({ avatar: uploaded.url })
            setUser(data.user)
            toast.success('Profile image updated')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not update profile image')
        } finally {
            setAvatarUploading(false)
        }
    }

    useEffect(() => {
        if (!user?._id) return
        const load = async () => {
            try {
                const [convRes, onlineRes] = await Promise.all([
                    getMyConversations(),
                    getOnlineUsers()
                ])
                setConversations(convRes.data.conversations)
                restoreActiveConversation(user._id)
                setOnlineUsers(onlineRes.data.onlineUsers)
            } catch {
                toast.error('Failed to load conversations')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [restoreActiveConversation, setConversations, setOnlineUsers, user?._id])

    return (
        <div className="w-full md:w-80 bg-dark-sidebar flex flex-col h-full border-r border-dark-border">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={avatarUploading}
                        aria-label="Change profile image"
                        title="Change profile image (JPEG, PNG, or WebP, max 200 KB)"
                        className="relative rounded-full disabled:opacity-60"
                    >
                        <Avatar src={user?.avatar} name={user?.name} size="sm" />
                        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-[10px] text-white opacity-0 transition hover:opacity-100">
                            {avatarUploading ? '...' : 'Edit'}
                        </span>
                    </button>
                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAvatarChange}
                    />
                    <span className="text-white font-semibold">SafeTalk</span>
                </div>
                <div className="flex items-center gap-2">
                    {user?.isAdmin && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="p-2 rounded-full hover:bg-dark-hover transition text-gray-400 hover:text-white"
                            title="Admin Panel"
                        >
                            ⚙️
                        </button>
                    )}
                    <button
                        onClick={toggleGroupModal}
                        className="p-2 rounded-full hover:bg-dark-hover transition text-gray-400 hover:text-white"
                        title="New Group"
                    >
                        👥
                    </button>
                    <button
                        onClick={toggleNewChat}
                        className="p-2 rounded-full hover:bg-dark-hover transition text-gray-400 hover:text-white"
                        title="New Chat"
                    >
                        ✏️
                    </button>
                </div>
            </div>

            {/* Search */}
            {showNewChat && (
                <div className="border-b border-dark-border">
                    <SearchBar onClose={toggleNewChat} />
                </div>
            )}

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center mt-8">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : conversations.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center mt-8 px-4">
                        No conversations yet. Start a new chat!
                    </p>
                ) : (
                    conversations.map(conv => (
                        <ConversationItem
                            key={conv._id}
                            conversation={conv}
                            isActive={activeConversation?._id === conv._id}
                            onClick={() => {
                                setActiveConversation(conv, user?._id)
                                setMobileChatOpen(true)
                            }}
                        />
                    ))
                )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-dark-border px-4 py-3">
                <span className="truncate text-sm text-gray-400" title={user?.email}>
                    {user?.name || user?.email}
                </span>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="shrink-0 rounded-lg px-3 py-2 text-sm text-gray-300 transition hover:bg-dark-hover hover:text-white"
                >
                    Log out
                </button>
            </div>

            {/* Group Modal */}
            <Modal
                isOpen={showGroupModal}
                onClose={toggleGroupModal}
                title="Create Group"
            >
                <GroupModal onClose={toggleGroupModal} />
            </Modal>
        </div>
    )
}

export default Sidebar