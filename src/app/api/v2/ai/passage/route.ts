import { aiStreamResponse } from '@/server/ai/routes'
import { options, route } from '@/server/http'

export const POST = route(
  (request) => aiStreamResponse(request, 'passage'),
  'ai.passage'
)
export const OPTIONS = options
