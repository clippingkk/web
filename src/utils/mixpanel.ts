import mixpanel from 'mixpanel-browser'

const IS_PROD = process.env.NODE_ENV === 'production'

mixpanel.init("a117786751946ffe4a094d0b19a75a4a", {
  debug: !!IS_PROD,
})
