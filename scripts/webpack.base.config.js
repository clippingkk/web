const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const AddAssertHtmlPlugin = require('add-asset-html-webpack-plugin')
const poststylus = require('poststylus')
const values = require('postcss-modules-values')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

const config = {
  mode: process.env.NODE_ENV,
  target: 'web',
  entry: [
    'whatwg-fetch',
    './src/App.tsx'
  ],
  output: {
    path: path.resolve(__dirname, '..', 'dist'),
    publicPath: '/',
    filename: 'bundle.[hash].js'
  },
  module: {
    rules: [{
      test: /.jsx?$/,
      exclude: [path.resolve(__dirname, '..', 'node_modules')],
      use: ['babel-loader']
    }, {
      test: /.tsx$/,
      exclude: [path.resolve(__dirname, '..', 'node_modules')],
      use: [{
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
        MiniCssExtractPlugin.loader, 'css-loader', 'stylus-loader'
      ],
    }, {
      test: /.css$/,
      exclude: /node_modules/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader?modules=true&camelCase=true&localIdentName=[name]_[local]-[hash:base64]&sourceMap=true',
        'postcss-loader'
      ]
    }, {
      test: /.css$/,
      include: /node_modules/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader'
      ]
    }, {
      test: /\.(png|jpg|jpeg|gif)$/,
      use: [{loader: 'url-loader', options: {limit: 500, name: '[name]-[hash].[ext]'}}]
    }, {
      test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
      use: [{loader: 'url-loader', options: {limit: 10000, mimetype: 'application/font-woff'}}]
    }, {
      test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
      use: [{loader: 'url-loader', options: {limit: 10000, mimetype: 'application/font-woff'}}]
    }, {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      use: [{loader: 'url-loader', options: {limit: 10000, mimetype: 'application/octet-stream'}}]
    }, {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      use: [{loader: 'file-loader'}]
    }, {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      use: [{loader: 'url-loader', options: {limit: 10000, mimetype: 'image/svg+xml'}}]
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      title: 'Kindle viewer',
      template: path.resolve(__dirname, 'template.html'),
      inject: 'body',
      chunks: ['main', 'common', 'manifest', 'styles'],
    }),
    new MiniCssExtractPlugin({
      filename: "app.[contenthash].css",
      chunkFilename: "[id].[contenthash].css"
    }),
    new AddAssertHtmlPlugin({
      filepath: path.resolve(__dirname, '..', 'dist', '*.dll.js'),
      includeSourcemap: process.env.NODE_ENV !== 'production'
    }),
    new webpack.DefinePlugin({
      __DEV__: process.env.NODE_ENV === 'development'
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true,
      stylus: {
        default: {
          use: [poststylus([require('autoprefixer')])]
        }
      }
    }),
    new webpack.NamedModulesPlugin()
  ],
  optimization: {
    runtimeChunk: {
      name: 'manifest',
    },
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      name: false,
      cacheGroups: {
        vendor: {
          name: 'common',
          chunks: 'initial',
          priority: -10,
          reuseExistingChunk: false,
          test: /node_modules\/(.*)\.js/,
        },
        styles: {
          name: 'styles',
          test: /\.(scss|css|less)$/,
          chunks: 'all',
          minChunks: 1,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.tsx']
  }
}

// your chunks name here
const dllRefs = ['vendor']
dllRefs.forEach(x => {
  config.plugins.push(
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require(`../dist/${x}-manifest.json`)
    })
  )
})

module.exports = config
