const Avatar = ({ src, name, size = 'md', online = false }) => {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-lg'
    }

    const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

    return (
        <div className="relative inline-block">
            {src ? (
                <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover`} />
            ) : (
                <div className={`${sizes[size]} rounded-full bg-secondary flex items-center justify-center font-semibold text-white`}>
                    {initials}
                </div>
            )}
            {online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-bg" />
            )}
        </div>
    )
}

export default Avatar