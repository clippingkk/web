import { CacheHandler } from '@neshca/cache-handler';
import createLruHandler from '@neshca/cache-handler/local-lru';
import createRedisHandler from '@neshca/cache-handler/redis-strings';
import { createClient } from 'redis';

CacheHandler.onCreation(async () => {
  let client;

  try {
    // Create a Redis client.
    client = createClient({
      url: process.env.CACHE_REDIS_URI,
    });

    // Redis won't work without error handling.
    client.on('error', () => { });
  } catch (error) {
    console.warn('Failed to create Redis client:', error);
  }

  if (client) {
    try {
      console.info('Connecting Redis client...');

      // Wait for the client to connect.
      // Caveat: This will block the server from starting until the client is connected.
      // And there is no timeout. Make your own timeout if needed.
      await client.connect();
      console.info('Redis client connected.');
    } catch (error) {
      console.warn('Failed to connect Redis client:', error);

      console.warn('Disconnecting the Redis client...');
      // Try to disconnect the client to stop it from reconnecting.
      client
        .disconnect()
        .then(() => {
          console.info('Redis client disconnected.');
        })
        .catch(() => {
          console.warn('Failed to quit the Redis client after failing to connect.');
        });
    }
  }

  /** @type {import("@neshca/cache-handler").Handler | null} */
  let handler;

  if (client?.isReady) {
    // Create the `redis-stack` Handler if the client is available and connected.
    handler = await createRedisHandler({
      client,
      keyPrefix: 'ck-web:',
      timeoutMs: 1000,
      keyExpirationStrategy: 'EXAT',
      sharedTagsKey: '__sharedTags__',
    });
  } else {
    // Fallback to LRU handler if Redis client is not available.
    // The application will still work, but the cache will be in memory only and not shared.
    handler = createLruHandler();
    console.warn('Falling back to LRU handler because Redis client is not available.');
  }

  return {
    handlers: [handler],
  };
});

export default CacheHandler;
