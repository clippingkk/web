const path = require('path')
const webpack = require('webpack')
const config = require('./webpack.base.config')

config.devtool = 'inline-source-map'
config.plugins.push(
  new webpack.HotModuleReplacementPlugin()
)

module.exports = {
  ...config,
  // watch: true,
  optimization: {
    ...config.optimization,
    runtimeChunk: true,
    removeAvailableModules: false,
    removeEmptyChunks: false,
    // splitChunks: false,
  },
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    historyApiFallback: true,
    hot: true,
    open: true,
    port: 8080,
    disableHostCheck: true,
    proxy: {
      // '/api/*': 'http://localhost:9654',
      // 'http://localhost:8080/api': 'http://localhost:9654/api'
    }
  }
}
// module.exports.serve = {
//   content: path.resolve(__dirname, '..', 'dist'),
//   host: 'localhost',
//   port: 8080,
//   add: (app) => {
//     // app.use(convert(proxy('/api', { target: 'http://localhost:8081' })));
//     app.use(convert(history()));
//   }
// };
