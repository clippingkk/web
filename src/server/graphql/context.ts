import { GraphQLError } from 'graphql'
import type { YogaInitialContext } from 'graphql-yoga'

import { optionalUserId } from '../auth'
import { ApiError } from '../errors'

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
  try {
    return {
      request,
      userId: await optionalUserId(request),
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '',
      language: language.split(',')[0],
    }
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    throw new GraphQLError(error.message, {
      originalError: error,
      extensions: {
        code: error.code,
        http: { status: error.status },
      },
    })
  }
}
