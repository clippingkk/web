import { setTimeout as delay } from 'node:timers/promises'

import { requireUserId } from '@/server/auth'
import { ApiError } from '@/server/errors'
import { body, options, route } from '@/server/http'

export const maxDuration = 90

const headers = {
  Referer: 'https://weread.qq.com/',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
  'Accept-Language': 'en,zh;q=0.9,zh-CN;q=0.8,zh-TW;q=0.7',
  Origin: 'https://weread.qq.com',
  'Content-Type': 'application/json',
}

async function weread(path: string, payload: unknown = {}) {
  const response = await fetch(`https://weread.qq.com${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  if (!response.ok)
    throw new ApiError(`WeRead returned ${response.status}`, 502)
  return response
}

export const GET = route(async (request) => {
  await requireUserId(request)
  const data = await weread('/web/login/getuid').then((response) =>
    response.json()
  )
  return Response.json({ count: 1, data })
}, 'weread.login.begin')

export const POST = route(async (request) => {
  await requireUserId(request)
  const payload = await body<{ uid: string }>(request)
  if (!payload.uid) throw new ApiError('uid required')
  let info: {
    skey?: string
    vid?: number
    code?: string
    pf?: number
    redirect_uri?: string
  } = {}
  for (let attempt = 0; attempt < 6; attempt += 1) {
    if (attempt) await delay(10_000)
    info = (await weread('/web/login/getinfo', payload).then((response) =>
      response.json()
    )) as typeof info
    if (info.code) break
  }
  if (!info.code) throw new ApiError('code not alive for now', 504)
  await weread('/web/login/weblogin', {
    code: info.code,
    skey: info.skey,
    vid: info.vid,
  })
  await weread('/web/login/session/init', {
    pf: 0,
    rt: '',
    skey: info.skey,
    vid: info.vid,
  })
  return Response.json({ count: 1, data: info })
}, 'weread.login.complete')
export const OPTIONS = options
