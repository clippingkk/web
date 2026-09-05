import { aiStreamResponse } from '@/server/ai/routes'
import { options, route } from '@/server/http'

export const POST = route(
  (request) => aiStreamResponse(request, 'recommendations'),
  'ai.recommendations'
)
export const OPTIONS = options
