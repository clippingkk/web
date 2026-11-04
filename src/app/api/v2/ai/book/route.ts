import { aiStreamResponse } from '@/server/ai/routes'
import { options, route } from '@/server/http'

export const POST = route(
  (request) => aiStreamResponse(request, 'book'),
  'ai.book'
)
export const OPTIONS = options
