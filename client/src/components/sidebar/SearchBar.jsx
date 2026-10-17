import { useState, useRef } from 'react'
import { searchUsers } from '../../api/user.api'
import { getOrCreateDirect } from '../../api/conversation.api'
import useChatStore from '../../store/chatStore'
import useAuthStore from '../../store/authStore'
import Avatar from '../shared/Avatar'
import toast from 'react-hot-toast'

const SearchBar = ({ onClose }) => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const { setActiveConversation, conversations, setConversations } = useChatStore()
    const { user: currentUser } = useAuthStore()
    const timerRef = useRef(null)

    const handleSearch = (e) => {
        const val = e.target.value
        setQuery(val)
        clearTimeout(timerRef.current)
        if (!val.trim()) return setResults([])
        timerRef.current = setTimeout(async () => {
            setLoading(true)
            try {
                const { data } = await searchUsers(val)
                setResults(data.users)
            } catch {
                toast.error('Search failed')
            } finally {
                setLoading(false)
            }
        }, 400)
    }

    const handleSelect = async (user) => {
        try {
            const { data } = await getOrCreateDirect(user._id)
            setActiveConversation(data.conversation, currentUser?._id)
            const exists = conversations.find(c => c._id === data.conversation._id)
            if (!exists) setConversations([data.conversation, ...conversations])
            onClose()
        } catch {
            toast.error('Could not open chat')
        }
    }

    return (
        <div className="p-3">
            <input
                autoFocus
                value={query}
                onChange={handleSearch}
                placeholder="Search by name or email..."
                className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition text-sm"
            />
            {loading && (
                <p className="text-gray-400 text-xs text-center mt-3">Searching...</p>
            )}
            {results.length > 0 && (
                <ul className="mt-2 space-y-1">
                    {results.map(user => (
                        <li
                            key={user._id}
                            onClick={() => handleSelect(user)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-hover cursor-pointer transition"
                        >
                            <Avatar src={user.avatar} name={user.name} size="sm" />
                            <div>
                                <p className="text-white text-sm font-medium">{user.name}</p>
                                <p className="text-gray-400 text-xs">{user.email}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {!loading && query && results.length === 0 && (
                <p className="text-gray-400 text-xs text-center mt-3">No users found</p>
            )}
        </div>
    )
}

export default SearchBar