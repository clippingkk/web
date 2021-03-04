export const API_HOST = process.env.NODE_ENV === 'production' ?
  'https://clippingkk-api.annatarhe.com' :
  'http://localhost:9654'

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

export const CDN_DEFAULT_DOMAIN = 'https://clippingkk-cdn.annatarhe.com'
