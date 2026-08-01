import { route } from '@/server/http'

export const GET = route(async (request, routeContext) => {
  const context = routeContext as {
    params: Promise<{ subPath?: string[] }>
  }
  const params = await context.params
  const path = Array.isArray(params.subPath)
    ? params.subPath.map(encodeURIComponent).join('/')
    : ''
  const source = new URL(`https://picsum.photos/${path}`)
  source.search = new URL(request.url).search
  const response = await fetch(source, { redirect: 'follow' })
  const headers = new Headers()
  headers.set(
    'Content-Type',
    response.headers.get('content-type') ?? 'application/octet-stream'
  )
  headers.set('Cache-Control', 'public, max-age=86400')
  return new Response(response.body, { status: response.status, headers })
}, 'image.proxy')
