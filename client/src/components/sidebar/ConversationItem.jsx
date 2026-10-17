import Avatar from '../shared/Avatar'
import { formatTime } from '../../utils/formatTime'
import useChatStore from '../../store/chatStore'
import useAuthStore from '../../store/authStore'

const ConversationItem = ({ conversation, isActive, onClick }) => {
    const { onlineUsers } = useChatStore()
    const { user } = useAuthStore()

    const isGroup = conversation.type === 'group'
    const other = !isGroup
        ? conversation.participants?.find(p => p._id !== user?._id)
        : null

    const name = isGroup ? conversation.groupName : other?.name
    const avatar = isGroup ? conversation.groupAvatar : other?.avatar
    const isOnline = !isGroup && onlineUsers.includes(other?._id)

    const lastMsg = conversation.lastMessage
    const lastMsgText = lastMsg?.type === 'image'
        ? '📷 Image'
        : lastMsg?.type === 'file'
            ? `📎 ${lastMsg.fileName || 'File'}`
            : lastMsg?.content || 'No messages yet'

    // Unread count: conversation objects don't include a messages array.
    // Show indicator when lastMessage exists and current user isn't in its readBy list.
    const unread = lastMsg && lastMsg.sender !== user?._id &&
        !(lastMsg.readBy?.some(id => id === user?._id || id?.toString() === user?._id))
        ? 1 : 0

    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition
        ${isActive ? 'bg-dark-hover' : 'hover:bg-dark-hover'}`}
        >
            <Avatar src={avatar} name={name} size="md" online={isOnline} />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className="text-white font-medium text-sm truncate">{name}</p>
                    {lastMsg && (
                        <span className="text-gray-400 text-xs shrink-0 ml-2">
                            {formatTime(lastMsg.createdAt)}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                    <p className="text-gray-400 text-xs truncate">{lastMsgText}</p>
                    {unread > 0 && (
                        <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0 ml-2">
                            {unread}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ConversationItem