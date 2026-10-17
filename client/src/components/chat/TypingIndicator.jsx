const TypingIndicator = ({ userName }) => {
    return (
        <div className="flex items-center gap-2 px-4 py-1">
            <div className="flex gap-1 items-center bg-dark-sidebar px-3 py-2 rounded-2xl">
                <span className="text-gray-400 text-xs">{userName} is typing</span>
                <div className="flex gap-0.5 ml-1">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default TypingIndicator