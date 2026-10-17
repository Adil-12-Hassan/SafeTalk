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
                <ChatWindow onBack={() => setMobileChatOpen(false)} />
            </div>
        </div>
    )
}

export default Chat