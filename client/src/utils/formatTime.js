export const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    })
}

export const formatDate = (date) => {
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const formatLastSeen = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) {
        return `last seen today at ${formatTime(date)}`
    }
    return `last seen ${formatDate(date)} at ${formatTime(date)}`
}