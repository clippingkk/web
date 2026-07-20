import { json, options, route } from '@/server/http'

export const POST = route(async () => json({ ok: true }))
export const OPTIONS = options
