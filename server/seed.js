import dotenv from 'dotenv'

dotenv.config()

const { default: mongoose } = await import('mongoose')
const { default: User } = await import('./src/models/User.js')

const seedUsers = [
    {
        name: 'Mr. Hassan',
        email: 'syedadilhassan06@gmail.com',
        isAdmin: true
    },
    {
        name: 'Syed Adil',
        email: 'adil12hassa@gmail.com',
        isAdmin: false
    }
]

const seed = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not set. Configure server/.env before seeding.')
    }

    try {
        await mongoose.connect(process.env.MONGO_URI)

        for (const user of seedUsers) {
            const result = await User.updateOne(
                { email: user.email },
                {
                    $set: {
                        name: user.name,
                        isAdmin: user.isAdmin,
                        isActive: true
                    },
                    $setOnInsert: { email: user.email }
                },
                { upsert: true, runValidators: true }
            )

            const action = result.upsertedCount ? 'created' : 'updated'
            console.log(`${action} ${user.isAdmin ? 'admin' : 'test'} account`)
        }
    } finally {
        await mongoose.disconnect()
    }
}

seed().catch(error => {
    console.error('Database seeding failed:', error.message)
    process.exitCode = 1
})
