// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: true,
// })
// const { withSentryConfig } = require('@sentry/nextjs')

import type { NextConfig } from 'next'

// const isProd = process.env.NODE_ENV === 'production'

const config: NextConfig = {
  generateBuildId: () => {
    return process.env.GIT_COMMIT ?? ''
  },
  reactCompiler: true,
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
  // webpack: (config, { webpack, isServer }) => {
  //   if (isServer) {
  //     config.experiments = { ...config.experiments, topLevelAwait: true }
  //     config.externals['node:fs'] = 'commonjs node:fs'
  //     config.externals['node:inspector/promises'] = 'commonjs node:inspector/promises'
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       fs: false,
  //       'inspector/promises': false
  //     }
  //     config.plugins.push(
  //       new webpack.NormalModuleReplacementPlugin(
  //         /^node:/,
  //         (resource: { request: string }) => {
  //           resource.request = resource.request.replace(/^node:/, '')
  //         },
  //       ),
  //     )
  //   }

  //   return config
  // },
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

// FIXME: 暂时关掉， leancloud cloud engine do not support yet
// module.exports = withSentryConfig(config, sentryWebpackPluginOptions)
//  export default withBundleAnalyzer(config)
export default config
