import mixpanel from 'mixpanel-browser'

const IS_DEV = process.env.DEV === 'true'

mixpanel.init('a117786751946ffe4a094d0b19a75a4a', {
  debug: IS_DEV,
})
