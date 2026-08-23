import type { NextConfig } from 'next'

const deploymentId = process.env.GIT_COMMIT?.trim() || undefined

const config: NextConfig = {
  serverExternalPackages: ['bullmq', 'pg', 'redis'],
  // enablePrerenderSourceMaps: false,
  // productionBrowserSourceMaps: false,
  deploymentId,
  // Disable React Compiler to avoid false positives with Floating UI and manual memoization
  reactCompiler: false,
  cacheComponents: true,
  typedRoutes: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
    // Next 16.3 defaults this to true, which shells out to `typescript/bin/tsc`.
    // Our `typescript` entry is an alias for @typescript/typescript6, which ships
    // `bin/tsc6` instead -- so CLI mode reports TypeScript as missing. The
    // compiler-API path (lib/typescript.js) is present and is what 16.2 used.
    useTypeScriptCli: false,
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
