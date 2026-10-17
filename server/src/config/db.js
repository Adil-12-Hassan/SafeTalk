import mongoose from 'mongoose'

let connectionPromise

const connectDB = () => {
    if (mongoose.connection.readyState === 1) {
        return Promise.resolve()
    }

    if (!process.env.MONGO_URI) {
        return Promise.reject(new Error('MONGO_URI is required'))
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGO_URI)
            .then(() => {
                console.log('Database Connected.')
                connectionPromise = undefined
            })
            .catch(err => {
                connectionPromise = undefined
                throw err
            })
    }

    return connectionPromise
}

export default connectDB