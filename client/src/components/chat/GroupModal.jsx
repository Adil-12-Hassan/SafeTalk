import { useRef, useState } from 'react'
import { searchUsers } from '../../api/user.api'
import { createGroup } from '../../api/conversation.api'
import useChatStore from '../../store/chatStore'
import useAuthStore from '../../store/authStore'
import Avatar from '../shared/Avatar'
import toast from 'react-hot-toast'

const GroupModal = ({ onClose }) => {
    const [groupName, setGroupName] = useState('')
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [selected, setSelected] = useState([])
    const [loading, setLoading] = useState(false)
    const { conversations, setConversations, setActiveConversation } = useChatStore()
    const { user: currentUser } = useAuthStore()
    const timerRef = useRef(null)

    const handleSearch = (e) => {
        const val = e.target.value
        setQuery(val)
        clearTimeout(timerRef.current)
        if (!val.trim()) return setResults([])
        timerRef.current = setTimeout(async () => {
            try {
                const { data } = await searchUsers(val)
                setResults(data.users.filter(u => !selected.find(s => s._id === u._id)))
            } catch {
                toast.error('Search failed')
            }
        }, 400)
    }

    const toggleSelect = (user) => {
        setSelected(prev =>
            prev.find(s => s._id === user._id)
                ? prev.filter(s => s._id !== user._id)
                : [...prev, user]
        )
    }

    const handleCreate = async () => {
        if (!groupName.trim()) return toast.error('Group name required')
        if (selected.length < 1) return toast.error('Add at least one participant')
        setLoading(true)
        try {
            const { data } = await createGroup(groupName, selected.map(s => s._id))
            setConversations([data.conversation, ...conversations])
            setActiveConversation(data.conversation, currentUser?._id)
            toast.success('Group created!')
            onClose()
        } catch {
            toast.error('Failed to create group')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <input
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="Group name"
                className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-sm"
            />

            {/* Selected */}
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selected.map(u => (
                        <span
                            key={u._id}
                            onClick={() => toggleSelect(u)}
                            className="flex items-center gap-1 bg-primary text-white text-xs px-2 py-1 rounded-full cursor-pointer"
                        >
                            {u.name} ✕
                        </span>
                    ))}
                </div>
            )}

            <input
                value={query}
                onChange={handleSearch}
                placeholder="Search participants..."
                className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary text-sm"
            />

            {results.length > 0 && (
                <ul className="space-y-1 max-h-40 overflow-y-auto">
                    {results.map(user => (
                        <li
                            key={user._id}
                            onClick={() => toggleSelect(user)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-hover cursor-pointer transition"
                        >
                            <Avatar src={user.avatar} name={user.name} size="sm" />
                            <p className="text-white text-sm">{user.name}</p>
                        </li>
                    ))}
                </ul>
            )}

            <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full bg-primary hover:bg-secondary text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 text-sm"
            >
                {loading ? 'Creating...' : 'Create Group'}
            </button>
        </div>
    )
}

export default GroupModal