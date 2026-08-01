import { json, options, route } from '@/server/http'

export const POST = route(
  async () => json({ ok: true }),
  'apple.notification.process'
)
export const OPTIONS = options
