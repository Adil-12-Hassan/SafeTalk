import crypto from 'crypto'

export const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString()
}
export const otpExpiry = () => {
    return new Date(Date.now() + 10 * 60 * 1000)
}