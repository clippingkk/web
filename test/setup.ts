import fetch from 'cross-fetch'

if (!global.fetch) {
  global.fetch = fetch
}
