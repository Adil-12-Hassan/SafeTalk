import { useState, useRef, useCallback } from 'react'
import useSocket from '../../hooks/useSocket'
import { uploadImage, uploadFile, isImageFile } from '../../utils/fileHelpers'
import toast from 'react-hot-toast'

const MessageInput = ({ conversationId }) => {
    const [text, setText] = useState('')
    const [uploading, setUploading] = useState(false)
    const fileRef = useRef(null)
    const typingRef = useRef(null)
    const { sendMessage, startTyping, stopTyping } = useSocket()

    const handleTyping = (e) => {
        setText(e.target.value)
        startTyping(conversationId)
        clearTimeout(typingRef.current)
        typingRef.current = setTimeout(() => stopTyping(conversationId), 1000)
    }

    const handleSend = useCallback(() => {
        if (!text.trim()) return
        sendMessage({ conversationId, content: text.trim(), type: 'text' })
        setText('')
        stopTyping(conversationId)
    }, [conversationId, sendMessage, stopTyping, text])

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 10 * 1024 * 1024) return toast.error('Max file size is 10MB')

        setUploading(true)
        try {
            const isImage = isImageFile(file)
            const uploaded = isImage ? await uploadImage(file) : await uploadFile(file)
            sendMessage({
                conversationId,
                type: uploaded.type,
                fileUrl: uploaded.url,
                fileName: uploaded.fileName || file.name,
                content: ''
            })
        } catch {
            toast.error('Upload failed')
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    return (
        <div className="flex items-center gap-2 px-4 py-3 border-t border-dark-border bg-dark-sidebar">
            {/* File Upload */}
            <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
            />
            <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="text-gray-400 hover:text-white transition p-2 rounded-full hover:bg-dark-hover disabled:opacity-50"
            >
                {uploading ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                )}
            </button>

            {/* Text Input */}
            <textarea
                value={text}
                onChange={handleTyping}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 bg-dark-hover border border-dark-border rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none text-sm max-h-32 overflow-y-auto"
            />

            {/* Send */}
            <button
                onClick={handleSend}
                disabled={!text.trim() || uploading}
                className="bg-primary hover:bg-secondary text-white p-2 rounded-full transition disabled:opacity-50"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
                </svg>
            </button>
        </div>
    )
}

export default MessageInput