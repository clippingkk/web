import { requireUserId } from '@/server/auth'
import { ApiError } from '@/server/errors'
import { options, route } from '@/server/http'
import { getWechatQrCode } from '@/server/wechat'

export const GET = route(async (request) => {
  await requireUserId(request)
  const params = new URL(request.url).searchParams
  const scene = params.get('scene')
  const page = params.get('page')
  if (!scene || !page) throw new ApiError('scene and page are required')
  const color = decodeURIComponent(params.get('color') ?? 'rgb(0,0,0)')
  const match = /^rgb\(\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\s*\)$/.exec(color)
  if (!match) throw new ApiError('color invalid')
  const rgb = match.slice(1).map(Number)
  if (rgb.some((value) => value > 255)) throw new ApiError('color invalid')
  const result = await getWechatQrCode({
    scene,
    page: decodeURIComponent(page),
    isHyaline: params.get('isHyaline') === 'true',
    width: Number(params.get('width') || 120),
    lineColor: { r: rgb[0], g: rgb[1], b: rgb[2] },
  })
  return new Response(result.data, {
    headers: { 'Content-Type': result.contentType },
  })
}, 'wechat.qrcode.generate')
export const OPTIONS = options
