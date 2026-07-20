import type { NextConfig } from 'next'

// const isProd = process.env.NODE_ENV === 'production'

const config: NextConfig = {
  serverExternalPackages: ['bullmq', 'pg', 'redis'],
  // enablePrerenderSourceMaps: false,
  // productionBrowserSourceMaps: false,
  generateBuildId: () => {
    return process.env.GIT_COMMIT ?? ''
  },
  // Disable React Compiler to avoid false positives with Floating UI and manual memoization
  reactCompiler: false,
  cacheComponents: true,

  // cacheHandler: (isProd && process.env.CACHE_REDIS_URI) ? require.resolve('./cache-handler.mjs') : undefined,
  // cacheMaxMemorySize: 0,
  typedRoutes: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars3.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'ck-cdn.annatarhe.cn',
      },
      {
        protocol: 'https',
        hostname: 'img1.doubanio.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'metadata.ens.domains',
      },
      {
        protocol: 'https',
        hostname: 'gateway.moralisipfs.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*{/}?',
        headers: [
          {
            key: 'X-Accel-Buffering',
            value: 'no',
          },
        ],
      },
    ]
  },
}

if (process.env.STANDALONE) {
  config.output = 'standalone'
}

export default config
