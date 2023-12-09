const { IncrementalCache } = require('@neshca/cache-handler')
const { createHandler } = require('@neshca/cache-handler/redis-strings')
const { createClient } = require('redis')

function createRedisClient(url) {
  const client = createClient({
    url,
  })

  client.on('error', (error) => {
    console.error('Redis error:', error.message)
  })

  return client
}

async function connect(client) {
  try {
    await client.connect()
  } catch (error) {
    console.error('Redis connection error:', error.message)
  }
}

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error('REDIS_URL environment variable is not set');
}

var client = createRedisClient(redisUrl)

connect(client).then(() => {
  console.log('Redis connected')
})
if (process.env.SERVER_STARTED) {
  IncrementalCache.onCreation(() => {
    return {
      diskAccessMode: 'read-no/write-no',
      catch: createHandler({
        client,
      })
    }
  })
}

module.exports = IncrementalCache
