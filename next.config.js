module.exports = {
  images: {
    domains: ['ck-cdn.annatarhe.cn'],
  },
  excludeFile: (str) => /__tests__/.test(str),
  env: {
    'DEV': process.env.NODE_ENV !== 'production'
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      loader: 'graphql-tag/loader',
    })
    config.module.rules.push({
      test: /\.ya?ml$/,
      type: 'json',
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
  swcMinify: true,
}
