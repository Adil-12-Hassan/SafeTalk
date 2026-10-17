import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})
export const sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"Safe <${process.env.EMAIL_USER}`,
        to: email,
        subject: 'Your SafeTalk OTP',
        html: `
            <h2>SafeTalk Login</h2>
            <p>Your OTP is: <strong>${otp}</strong></p>
            <p>Valid for 10 minutes. Do not share it with anyone.</p>`
    })
}