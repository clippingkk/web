// @ts-check
// const { withSentryConfig } = require('@sentry/nextjs')

const isProd = process.env.NODE_ENV === 'production'

const sentryWebpackPluginOptions = {
  silent: true,
};
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/**
 * @type {import('next').NextConfig}
 **/
const config = {
  generateBuildId: () => {
    return process.env.GIT_COMMIT
  },
  cacheHandler: isProd ? require.resolve('./cache-handler.mjs') : undefined,
  cacheMaxMemorySize: 0,
  experimental: {
    instrumentationHook: true,
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
}

if (process.env.IS_FLY_IO) {
  config.output = 'standalone'
}

// FIXME: 暂时关掉， leancloud cloud engine do not support yet
// module.exports = withSentryConfig(config, sentryWebpackPluginOptions)
module.exports = withBundleAnalyzer(config)
