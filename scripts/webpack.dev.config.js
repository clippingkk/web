const path = require('path')
const webpack = require('webpack')
const config = require('./webpack.base.config')
const convert = require('koa-connect');
const history = require('connect-history-api-fallback');
const proxy = require('http-proxy-middleware');

config.devtool = 'inline-source-map'
config.plugins.push(
  new webpack.NamedModulesPlugin()
)

module.exports = config
module.exports.serve = {
  content: path.resolve(__dirname, '..', 'dist'),
  host: 'localhost',
  port: 8080,
  add: (app) => {
    // app.use(convert(proxy('/api', { target: 'http://localhost:8081' })));
    app.use(convert(history()));
  }
};
