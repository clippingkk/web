// @ts-check
// const { i18n } = require('./next-i18next.config')
// const { withSentryConfig } = require('@sentry/nextjs')

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
  // i18n,
  //  strictMode: true,
  // sentry: {
  //   hideSourceMaps: true
  // },
  // experimental: {
    // runtime: 'experimental-edge',
    // swcPlugins: [['@swc-jotai/debug-label', {}]],
  // },
  // i18n: {
  //   locales: ['default', 'zhCN', 'en', 'ko'],
  //   defaultLocale: 'zhCN'
  // },
  images: {
    domains: [
      'ck-cdn.annatarhe.cn',
      'img1.doubanio.com',
      'avatars.githubusercontent.com',
      'metadata.ens.domains',
      'gateway.moralisipfs.com'
    ],
  },
  //  excludeFile: (str) => /__tests__/.test(str),
  env: {
    DEV: JSON.stringify(process.env.NODE_ENV !== 'production'),
    GIT_COMMIT: JSON.stringify(process.env.GIT_COMMIT),
    infuraKey: JSON.stringify(process.env.infuraKey || '')
  },
  // swcMinify: true
}

if (process.env.IS_FLY_IO) {
  config.output = 'standalone'
}

// FIXME: 暂时关掉， leancloud cloud engine do not support yet
// module.exports = withSentryConfig(config, sentryWebpackPluginOptions)
module.exports = withBundleAnalyzer(config)
