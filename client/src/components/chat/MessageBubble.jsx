import { formatTime } from '../../utils/formatTime'
import useAuthStore from '../../store/authStore'

const MessageBubble = ({ message, onDelete }) => {
    const { user } = useAuthStore()
    const isOwn = message.sender?._id === user?._id

    const renderContent = () => {
        if (message.type === 'image') {
            return (
                <img
                    src={message.fileUrl}
                    alt="shared"
                    className="max-w-xs rounded-lg cursor-pointer"
                    onClick={() => window.open(message.fileUrl, '_blank')}
                />
            )
        }
        if (message.type === 'file') {
            return (
                <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-white underline text-sm"
                >
                    📎 {message.fileName || 'Download file'}
                </a>
            )
        }
        return <p className="text-sm text-white break-words">{message.content}</p>
    }

    const renderStatus = () => {
        if (!isOwn) return null
        const readCount = (message.readBy?.length ?? 0) - 1
        const deliveredCount = (message.deliveredTo?.length ?? 0) - 1
        if (readCount > 0) return <span className="text-blue-400 text-xs">✓✓</span>
        if (deliveredCount > 0) return <span className="text-gray-400 text-xs">✓✓</span>
        return <span className="text-gray-400 text-xs">✓</span>
    }

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 px-4 group`}>
            <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl relative
        ${isOwn
                    ? 'bg-bubble-out rounded-tr-none'
                    : 'bg-bubble-in rounded-tl-none'
                }`}
            >
                {/* Sender name in group */}
                {!isOwn && message.sender?.name && (
                    <p className="text-primary text-xs font-semibold mb-1">
                        {message.sender.name}
                    </p>
                )}

                {renderContent()}

                <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-gray-400 text-xs">
                        {formatTime(message.createdAt)}
                    </span>
                    {renderStatus()}
                </div>

                {/* Delete button */}
                {isOwn && (
                    <button
                        onClick={() => onDelete(message._id)}
                        className="absolute -top-2 -left-2 bg-dark-bg text-gray-400 hover:text-red-400 text-xs w-5 h-5 rounded-full hidden group-hover:flex items-center justify-center"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    )
}

export default MessageBubble