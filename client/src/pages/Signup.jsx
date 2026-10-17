import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { signup } from '../api/auth.api'

const Signup = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoading(true)

        try {
            const normalizedEmail = email.trim().toLowerCase()
            await signup(name.trim(), normalizedEmail)
            toast.success('Account created. Sign in to receive your OTP.')
            navigate('/login', { state: { email: normalizedEmail } })
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create account')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Create your SafeTalk account</h1>
                    <p className="text-gray-400 text-sm mt-1">Sign up to start a private conversation.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-dark-sidebar rounded-xl p-6 space-y-4">
                    <div>
                        <label htmlFor="signup-name" className="text-sm text-gray-400 mb-1 block">Name</label>
                        <input
                            id="signup-name"
                            type="text"
                            value={name}
                            onChange={event => setName(event.target.value)}
                            placeholder="Your name"
                            required
                            maxLength={80}
                            autoComplete="name"
                            className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="signup-email" className="text-sm text-gray-400 mb-1 block">Email Address</label>
                        <input
                            id="signup-email"
                            type="email"
                            value={email}
                            onChange={event => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                            className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-secondary text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                    <p className="text-center text-sm text-gray-400">
                        Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Signup
