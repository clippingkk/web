import { getServerEnv } from '@/server/env'
import { json, options, route } from '@/server/http'

export const GET = route(
  async () =>
    json({ cdn: getServerEnv().S3_HOST || 'https://ck-cdn.annatarhe.cn' }),
  'config.read'
)
export const OPTIONS = options
