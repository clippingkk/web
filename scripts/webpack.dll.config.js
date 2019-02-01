const webpack = require('webpack')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

// split your chunks
const vendors = [
  'whatwg-fetch',
  'fastclick'
]

const reacts = [
  'react',
  '@reach/router',
  'react-dom',
  'redux',
  'react-transition-group',
  'react-redux',
  'redux-saga'
]

const config = {
  output: {
    path: path.resolve(__dirname, '..', 'dist'),
    filename: '[name]_[hash].dll.js',
    library: '[name]'
  },
  entry: {
    vendor: vendors,
    reacts
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: process.env.NODE_ENV !== 'production' ? '#source-map' : false,
  plugins: [
    new webpack.DllPlugin({
      path: path.resolve(__dirname, '..', 'dist', '[name]-manifest.json'),
      name: '[name]',
      context: __dirname
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static'
    })
  ]
}

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    new webpack.DefinePlugin({ 'process.env': { NODE_ENV: '"production"' } })
  )
}

module.exports = config
