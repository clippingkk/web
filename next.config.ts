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
  
  // cacheHandler: (isProd && process.env.CACHE_REDIS_URI) ? require.resolve('./cache-handler.mjs') : undefined,
  cacheMaxMemorySize: 0,
  experimental: {
    // ppr: true,
    useLightningcss: true,
    // typedEnv: true,
    // typedRoutes: true,
  },
  images: {
    domains: [
      'ck-cdn.annatarhe.cn',
      'img1.doubanio.com',
      'avatars.githubusercontent.com',
      'metadata.ens.domains',
      'gateway.moralisipfs.com'
    ],
  },
  env: {
    DEV: JSON.stringify(process.env.NODE_ENV !== 'production'),
    GIT_COMMIT: JSON.stringify(process.env.GIT_COMMIT || ''),
    NEXT_PUBLIC_PP_TOKEN: JSON.stringify(process.env.NEXT_PUBLIC_PP_TOKEN || ''),
    infuraKey: JSON.stringify(process.env.infuraKey || '')
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
