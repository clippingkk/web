const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const AddAssertHtmlPlugin = require('add-asset-html-webpack-plugin')
const poststylus = require('poststylus')
const values = require('postcss-modules-values')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const __DEV__ = process.env.NODE_ENV !== 'production'

const config = {
  cache: true,
  mode: process.env.NODE_ENV,
  target: 'web',
  entry: [
    'whatwg-fetch',
    '@ungap/url-search-params',
    'intersection-observer',
    './src/App.tsx'
  ],
  output: {
    path: path.resolve(__dirname, '..', 'dist' + (__DEV__ ? '-dev' : '')),
    publicPath: '/',
    filename: `bundle${__DEV__ ? '.[id]' : '.[contenthash]'}.js`
  },
  module: {
    rules: [{
      test: /.[jm]sx?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            plugins: [
              __DEV__ && require.resolve('react-refresh/babel')
            ].filter(Boolean)
          }
        }
      ]
    }, {
      test: /.tsx?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            plugins: [
              __DEV__ && require.resolve('react-refresh/babel')
            ].filter(Boolean)
          }
        },
        {
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          experimentalWatchApi: true,
        }
      }]
    }, {
      test: /.styl$/,
      exclude: /node_modules/,
      use: [
        __DEV__ ? 'style-loader' : MiniCssExtractPlugin.loader,
        'css-loader',
        'stylus-loader'
      ],
    }, {
      test: /.css$/,
      exclude: [
        path.resolve(__dirname, '..', 'src', 'styles', 'tailwind.css'),
        /node_modules/,
      ],
      use: [
        __DEV__ ? 'style-loader' : MiniCssExtractPlugin.loader,
        'css-loader?modules=true&sourceMap=true&esModule=false',
        'postcss-loader'
      ]
    }, {
      test: /.css$/,
      include: [
        path.resolve(__dirname, '..', 'src', 'styles', 'tailwind.css'),
        /emoji-mart/,
        /react-toastify/,
      ],
      use: [
        __DEV__ ? 'style-loader' : MiniCssExtractPlugin.loader,
        'css-loader',
        'postcss-loader'
      ]
    }, {
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader'
    }, {
        test: /\.ya?ml$/,
        type: 'json',
        use: 'yaml-loader'
    }, {
      test: /\.(png|jpg|jpeg|gif)$/,
      exclude: /node_modules/,
      use: [{ loader: 'url-loader', options: { limit: 500, name: '[name]-[hash].[ext]' } }]
    }, {
      test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
      exclude: /node_modules/,
      use: [{ loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff' } }]
    }, {
      test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
      exclude: /node_modules/,
      use: [{ loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff' } }]
    }, {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      exclude: /node_modules/,
      use: [{ loader: 'url-loader', options: { limit: 10000, mimetype: 'application/octet-stream' } }]
    }, {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      exclude: /node_modules/,
      use: [{ loader: 'file-loader' }]
    }, {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      exclude: /node_modules/,
      use: [{ loader: 'url-loader', options: { limit: 10000, mimetype: 'image/svg+xml' } }]
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      title: 'ClippingKK 是 kindle 笔记整理收集复盘的好帮手',
      template: path.resolve(__dirname, __DEV__ ? 'template.html' : 'release.html'),
      inject: 'body',
      chunks: ['main', 'common', 'manifest', 'styles'],
    }),
    // new OptimizeCssAssetsPlugin({
      // // assetNameRegExp: /\.optimize\.css$/g,
      // cssProcessor: require('cssnano'),
      // cssProcessorPluginOptions: {
        // preset: ['default', { discardComments: { removeAll: true } }],
      // },
      // canPrint: true
    // }),
    new AddAssertHtmlPlugin({
      filepath: path.resolve(__dirname, '..', 'dist' + (__DEV__ ? '-dev' : ''), '*.dll.js'),
      includeSourcemap: process.env.NODE_ENV !== 'production'
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
      'env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      __VERSION__: JSON.stringify(process.env.VERSION || 'dev')
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true,
      stylus: {
        default: {
          use: [poststylus([require('autoprefixer')])]
        }
      }
    }),
    __DEV__ && new ReactRefreshPlugin()
  ].filter(Boolean),
  optimization: {
    runtimeChunk: {
      name: 'manifest',
    },
    splitChunks: {
      chunks: 'async',
      minSize: 20000,
      minRemainingSize: 0,
      maxSize: 1 << 16,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      automaticNameDelimiter: '~',
      enforceSizeThreshold: 50000,
      // cacheGroups: {
      //   defaultVendors: {
      //     test: /[\\/]node_modules[\\/]/,
      //     priority: -10
      //   },
      //   default: {
      //     minChunks: 2,
      //     priority: -20,
      //     reuseExistingChunk: true
      //   }
      // }
    }
  },
  resolve: {
    extensions: ['.js', '.jsx', '.tsx', '.ts']
  }
}

// your chunks name here
const dllRefs = ['vendor', 'reacts']
dllRefs.forEach(x => {
  config.plugins.push(
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require(`../dist${__DEV__ ? '-dev' : ''}/${x}-manifest.json`)
    })
  )
})

module.exports = config
