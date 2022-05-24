module.exports = {
  strictMode: true,
  // experimental: {
  //   runtime: 'edge',
  // },
  // i18n: {
  //   locales: ['default', 'zhCN', 'en', 'ko'],
  //   defaultLocale: 'zhCN'
  // },
  images: {
    domains: ['ck-cdn.annatarhe.cn', 'img1.doubanio.com'],
  },
  excludeFile: (str) => /__tests__/.test(str),
  env: {
    'DEV': process.env.NODE_ENV !== 'production',
    'infuraKey': process.env.infuraKey || ''
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      loader: 'graphql-tag/loader',
    })
    config.module.rules.push({
      test: /\.ya?ml$/,
      type: 'json',
      options: { asJSON: true },
      loader: 'yaml-loader',
    })
    config.module.rules.push(
      {
        test: /__tests__\/\.*\.[j|t]sx?$/,
        loader: 'ignore-loader'
      }
    )
    return config
  },
  // swcMinify: true
}
