const webpack = require('webpack')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const __DEV__ = process.env.NODE_ENV !== 'production'

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
  'react-dark-mode-toggle',
  '@apollo/client'
]

const distDirname = 'dist' + (__DEV__ ? '-dev' : '')

const config = {
  output: {
    path: path.resolve(__dirname, '..', distDirname),
    filename: `[name]_[${__DEV__ ? 'id' : 'contenthash'}].dll.js`,
    library: '[name]'
  },
  entry: {
    vendor: vendors,
    reacts
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  // devtool: process.env.NODE_ENV !== 'production' ? '#source-map' : false,
  plugins: [
    new webpack.DllPlugin({
      path: path.resolve(__dirname, '..', distDirname, '[name]-manifest.json'),
      name: '[name]',
      context: __dirname,
      entryOnly: false
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
