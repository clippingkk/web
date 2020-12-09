const config = require('./webpack.base.config')
const webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

config.output.publicPath = '/'

config.plugins.push(
  new MiniCssExtractPlugin({
    filename: "app.[contenthash].css",
    chunkFilename: "[id].[contenthash].css"
  }),
  new BundleAnalyzerPlugin({
    analyzerMode: 'static'
  })
)

module.exports = config
