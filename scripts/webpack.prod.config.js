const config = require('./webpack.base.config')
const webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')

config.output.publicPath = '/'

config.plugins.push(
  new MiniCssExtractPlugin({
    filename: "app.[contenthash].css",
    chunkFilename: "[id].[contenthash].css"
  }),
  new BundleAnalyzerPlugin({
    analyzerMode: 'static'
  }),
  new WorkboxPlugin.GenerateSW({
    clientsClaim: true,
    skipWaiting: true
  }),
  new CopyWebpackPlugin([
    { from: 'src/manifest', to: 'manifest' }
  ])
)
config.optimization = {
  ...config.optimization,
  minimize: true,
  minimizer: [
    // new ESBuildMinifyPlugin({
    // target: 'es2015' // Syntax to compile to (see options below for possible values)
    // }),
    ...config.optimization.minimizer,
    new TerserPlugin(),
  ]
}

module.exports = config
