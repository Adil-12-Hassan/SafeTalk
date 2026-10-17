import dotenv from 'dotenv'
import Redis from 'ioredis'

dotenv.config()

const redis = new Redis(process.env.REDIS_URL)

const connectRedis = () => {
    redis.on("connect", () => {
        console.log("Redis Connected.");
    });

    redis.on("error", (err) => {
        console.log("Redis error:", err.message);
    });
};

export { redis };
export default connectRedis;
