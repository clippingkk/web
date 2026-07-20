import type { YogaInitialContext } from 'graphql-yoga'

import { optionalUserId } from '../auth'

export type GraphQLContext = {
  request: Request
  userId: number
  ip: string
  language: string
}

export async function createGraphQLContext(
  initial: YogaInitialContext
): Promise<GraphQLContext> {
  const request = initial.request
  const language =
    request.headers.get('x-accept-language') ??
    request.headers.get('accept-language') ??
    'en'
  return {
    request,
    userId: await optionalUserId(request),
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '',
    language: language.split(',')[0],
  }
}
