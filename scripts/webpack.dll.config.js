const webpack = require('webpack')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

// split your chunks
const vendors = [
  'whatwg-fetch',
  'sweetalert',
  'fingerprintjs2',
  'js-sha256',
  'intersection-observer',
  '@sentry/browser',
  '@ungap/url-search-params',
  'redux',
  'mixpanel-browser',
]

const reacts = [
  'react',
  '@reach/router',
  'react-dom',
  'react-transition-group',
  'react-redux',
  'redux-saga',
  '@nearform/react-animation',
  'react-table',
  '@apollo/client'
]

const distDirname = 'dist' + (process.env.NODE_ENV !== 'production' ? '-dev' : '')

const config = {
  output: {
    path: path.resolve(__dirname, '..', distDirname),
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
      path: path.resolve(__dirname, '..', distDirname, '[name]-manifest.json'),
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
} else {
  config.plugins.push(
    new webpack.HotModuleReplacementPlugin()
  )
}

module.exports = config
