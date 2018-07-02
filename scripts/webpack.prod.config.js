const config = require('./webpack.base.config')
const webpack = require('webpack')

config.output.publicPath = '/'

config.plugins.push(
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: '"production"'
    }
  })
)

module.exports = config
