import { useEffect } from 'react'

const Modal = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={onClose}>
            <div
                className="bg-dark-sidebar rounded-lg p-6 w-full max-w-md mx-4"
                onClick={e => e.stopPropagation()}>
                {title && (<h2 className="text-lg font-semibold text-white mb-4">{title}</h2>)}
                {children}
            </div>
        </div>
    )
}

export default Modal