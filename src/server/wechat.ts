import { requireEnv } from './env'
import { ApiError } from './errors'
import { cacheGet, cacheSet } from './redis'

export async function getWechatAccessToken() {
  const cached = await cacheGet<string>('wechat:accessToken')
  if (cached) return cached
  const url = new URL('https://api.weixin.qq.com/cgi-bin/token')
  url.searchParams.set('grant_type', 'client_credential')
  url.searchParams.set('appid', requireEnv('WECHAT_APP_ID'))
  url.searchParams.set('secret', requireEnv('WECHAT_SECRET'))
  const payload = (await fetch(url).then((response) => response.json())) as {
    access_token?: string
    errcode?: number
    errmsg?: string
  }
  if (!payload.access_token)
    throw new ApiError(payload.errmsg ?? 'WeChat token request failed', 502)
  await cacheSet('wechat:accessToken', payload.access_token, 90 * 60)
  return payload.access_token
}

export async function getWechatQrCode(payload: {
  scene: string
  page: string
  isHyaline: boolean
  width: number
  lineColor: { r: number; g: number; b: number }
}) {
  const accessToken = await getWechatAccessToken()
  const response = await fetch(
    `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scene: payload.scene,
        page: payload.page,
        is_hyaline: payload.isHyaline,
        width: payload.width,
        line_color: payload.lineColor,
      }),
    }
  )
  const contentType =
    response.headers.get('content-type') ?? 'application/octet-stream'
  const data = await response.arrayBuffer()
  if (!response.ok || contentType.includes('application/json')) {
    const message = Buffer.from(data).toString('utf8')
    throw new ApiError(`WeChat QR code request failed: ${message}`, 502)
  }
  return { data, contentType }
}

export async function wechatLogin(code: string) {
  const url = new URL('https://api.weixin.qq.com/sns/jscode2session')
  url.searchParams.set('appid', requireEnv('WECHAT_APP_ID'))
  url.searchParams.set('secret', requireEnv('WECHAT_SECRET'))
  url.searchParams.set('js_code', code)
  url.searchParams.set('grant_type', 'authorization_code')
  const payload = (await fetch(url).then((response) => response.json())) as {
    openid?: string
    unionid?: string
    session_key?: string
    errmsg?: string
  }
  if (!payload.openid)
    throw new ApiError(payload.errmsg ?? 'WeChat login failed')
  return payload
}
