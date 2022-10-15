const __DEV__ = process.env.NODE_ENV !== 'production'

export const API_HOST = __DEV__ ?
  'http://localhost:19654' :
  'https://clippingkk-api.annatarhe.com'

export const WENQU_API_HOST = 'https://wenqu.annatarhe.cn/api/v1'
export const WENQU_SIMPLE_TOKEN = '500ae25e22b5de1b6c44a7d78908e7b7cc63f97b55ea9cdc50aa8fcd84b1fcba'
export const GithubClientID = '3659f6b0ecfe917d69e6'

export const SignInWithAppleOptions = {
  clientId: "com.annatarhe.clippingkk",
  scope: "name email",
  // redirectURI: "https://clippingkk.annatarhe.com/oauth/apple",
  redirectURI: "https://local.dev.annatarhe.cn/oauth/apple",
  state: "origin:web",
  usePopup: true,
}

// export const CDN_DEFAULT_DOMAIN = 'https://clippingkk-cdn.annatarhe.com'
export const CDN_DEFAULT_DOMAIN = 'https://ck-cdn.annatarhe.cn'

export const LEANCLOUD = {
  APP_ID: 'aA4dKCxL9noDX5CyYp2AdnHl-9Nh9j0Va',
  APP_KEY: 'QQ7h7pbOY4xFWEap8fVuFtcl',
  SERVER_URL: 'https://clippingkk-lc.annatarhe.cn'
}

export const APP_API_STEP_LIMIT = 10

export const APP_URL_ORIGIN = __DEV__ ? 'http://localhost:3000' : 'https://clippingkk.annatarhe.com'
export const CF_TURNSTILE_SITE_KEY = '0x4AAAAAAAA361EJRDzUhf_b'
