import Redis from 'ioredis'

let redisClient = null
let isRedisConnected = false

try {
  const redisHost = process.env.REDIS_HOST || '127.0.0.1'
  const redisPort = Number(process.env.REDIS_PORT) || 6379

  redisClient = new Redis({
    host: redisHost,
    port: redisPort,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      if (times > 3) {
        return null // Stop retrying after 3 attempts
      }
      return Math.min(times * 100, 2000)
    },
  })

  redisClient.connect().then(() => {
    isRedisConnected = true
    console.log('⚡ Redis Cache Connected successfully')
  }).catch((err) => {
    isRedisConnected = false
    console.log('⚠️ Redis Cache connection unavailable. Fallback to direct MySQL query execution.')
  })

  redisClient.on('error', (err) => {
    isRedisConnected = false
  })
} catch (e) {
  isRedisConnected = false
  console.log('⚠️ Redis initialization fallback active.')
}

/**
 * Get cached data by key
 */
export async function getCache(key) {
  if (!isRedisConnected || !redisClient) return null
  try {
    const data = await redisClient.get(key)
    return data ? JSON.parse(data) : null
  } catch (err) {
    return null
  }
}

/**
 * Set cached data by key with optional TTL (default: 300 seconds / 5 mins)
 */
export async function setCache(key, value, ttlSeconds = 300) {
  if (!isRedisConnected || !redisClient) return
  try {
    const str = JSON.stringify(value)
    if (ttlSeconds > 0) {
      await redisClient.set(key, str, 'EX', ttlSeconds)
    } else {
      await redisClient.set(key, str)
    }
  } catch (err) {
    // Silent catch
  }
}

/**
 * Invalidate specific key or matching pattern
 */
export async function invalidateCachePattern(pattern) {
  if (!isRedisConnected || !redisClient) return
  try {
    const keys = await redisClient.keys(pattern)
    if (keys.length > 0) {
      await redisClient.del(...keys)
    }
  } catch (err) {
    // Silent catch
  }
}

export default redisClient
