import type { NextConfig } from 'next'

const deploymentId = process.env.GIT_COMMIT?.trim() || undefined

const config: NextConfig = {
  // Apple's library verifies JWS with jsrsasign and node:crypto; keep it out of the bundle.
  serverExternalPackages: [
    '@apple/app-store-server-library',
    'bullmq',
    'ioredis',
    'pg',
    'redis',
  ],
  // enablePrerenderSourceMaps: false,
  // productionBrowserSourceMaps: false,
  deploymentId,
  // Disable React Compiler to avoid false positives with Floating UI and manual memoization
  reactCompiler: false,
  cacheComponents: true,
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
  // Retired routes. Redirects run before the filesystem and carry the request's
  // query string through, so `/auth/auth-v4?next=/x` lands on `/auth?next=/x`.
  async redirects() {
    return [
      {
        source: '/auth/:legacy(auth-v2|auth-v3|auth-v4|signin|phone|github)',
        destination: '/auth',
        permanent: true,
      },
      {
        // Old OAuth callbacks: providers may still send people here, and a
        // future provider could reuse the path, so do not let browsers cache it.
        source: '/auth/callback/:provider(apple|metamask)',
        destination: '/auth',
        permanent: false,
      },
      {
        source: '/dash/:userid/newbie',
        destination: '/dash/:userid/profile?with_profile_editor=1',
        permanent: true,
      },
    ]
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
