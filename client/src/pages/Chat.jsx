import { useEffect } from 'react'
import Sidebar from '../components/sidebar/Sidebar'
import ChatWindow from '../components/chat/ChatWindow'
import useChatStore from '../store/chatStore'
import useUIStore from '../store/uiStore'

const Chat = () => {
    const { activeConversation } = useChatStore()
    const { isMobileChatOpen, setMobileChatOpen } = useUIStore()

    useEffect(() => {
        if (activeConversation) setMobileChatOpen(true)
    }, [activeConversation, setMobileChatOpen])

    return (
        <div className="flex h-screen bg-dark-bg overflow-hidden">

            {/* Sidebar - hidden on mobile when chat open */}
            <div className={`
        ${isMobileChatOpen ? 'hidden' : 'flex'} md:flex
        w-full md:w-80 shrink-0
      `}>
                <Sidebar />
            </div>

            {/* Chat Window */}
            <div className={`
        ${isMobileChatOpen ? 'flex' : 'hidden'} md:flex
        flex-1 flex-col
      `}>
                {/* Mobile back button */}
                {isMobileChatOpen && (
                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileChatOpen(false)}
                            className="absolute top-3 left-3 z-10 text-gray-400 hover:text-white p-1"
                        >
                            ← Back
                        </button>
                    </div>
                )}
                <ChatWindow />
            </div>
        </div>
    )
}

export default Chat