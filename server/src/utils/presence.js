const onlineSockets = new Map()

export const addOnlineSocket = (userId, socketId) => {
    let sockets = onlineSockets.get(userId)
    const isFirstSocket = !sockets

    if (!sockets) {
        sockets = new Set()
        onlineSockets.set(userId, sockets)
    }

    sockets.add(socketId)
    return isFirstSocket
}

export const removeOnlineSocket = (userId, socketId) => {
    const sockets = onlineSockets.get(userId)
    if (!sockets) return false

    sockets.delete(socketId)
    if (sockets.size > 0) return false

    onlineSockets.delete(userId)
    return true
}

export const getOnlineUserIds = () => [...onlineSockets.keys()]

export const isUserOnline = userId => onlineSockets.has(userId)

export const isUserOnlineExcept = (userId, excludedUserId) =>
    userId !== excludedUserId && isUserOnline(userId)
