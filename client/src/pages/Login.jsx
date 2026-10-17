import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { requestOTP, verifyOTP } from '../api/auth.api'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const Login = () => {
    const location = useLocation()
    const [step, setStep] = useState('email') // email | otp
    const [email, setEmail] = useState(location.state?.email || '')
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const { setUser } = useAuthStore()
    const navigate = useNavigate()

    const startCountdown = () => {
        setCountdown(60)
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) { clearInterval(interval); return 0 }
                return prev - 1
            })
        }, 1000)
    }

    const handleRequestOTP = async (e) => {
        e.preventDefault()
        if (!email) return toast.error('Enter your email')
        setLoading(true)
        try {
            await requestOTP(email)
            toast.success('OTP sent to your email')
            setStep('otp')
            startCountdown()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async (e) => {
        e.preventDefault()
        if (!otp) return toast.error('Enter OTP')
        setLoading(true)
        try {
            const { data } = await verifyOTP(email, otp)
            setUser(data.user)
            toast.success('Welcome to SafeTalk!')
            navigate('/')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid OTP')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
            <div className="w-full max-w-sm">

                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white">SafeTalk</h1>
                    <p className="text-gray-400 text-sm mt-1">Private. Secure. Personal.</p>
                </div>

                {/* Card */}
                <div className="bg-dark-sidebar rounded-xl p-6">
                    {step === 'email' ? (
                        <form onSubmit={handleRequestOTP} className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-secondary text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                            <p className="text-center text-sm text-gray-400">
                                New here? <Link to="/signup" className="text-primary hover:underline">Create an account</Link>
                            </p>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">
                                    Enter OTP sent to <span className="text-white">{email}</span>
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value)}
                                    placeholder="6-digit OTP"
                                    maxLength={6}
                                    className="w-full bg-dark-hover border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition tracking-widest text-center text-xl"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-secondary text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <div className="text-center">
                                {countdown > 0 ? (
                                    <p className="text-gray-400 text-sm">Resend OTP in {countdown}s</p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleRequestOTP}
                                        className="text-primary text-sm hover:underline"
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="w-full text-gray-400 text-sm hover:text-white transition"
                            >
                                ← Change email
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Login