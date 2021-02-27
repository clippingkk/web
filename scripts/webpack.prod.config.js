const config = require('./webpack.base.config')
const webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

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
// config.optimization = {
//   ...config.optimization,
//   minimize: true,
//   minimizer: [
//     new ESBuildMinifyPlugin({
//       target: 'es2015' // Syntax to compile to (see options below for possible values)
//     })
//   ]
// }

module.exports = config
