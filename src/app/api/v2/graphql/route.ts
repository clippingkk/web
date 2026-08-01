import { createYoga } from 'graphql-yoga'

import { createGraphQLContext } from '@/server/graphql/context'
import { graphQLSchema } from '@/server/graphql/schema'
import { options, route } from '@/server/http'

export const maxDuration = 180

const yoga = createYoga({
  schema: graphQLSchema,
  graphqlEndpoint: '/api/v2/graphql',
  context: createGraphQLContext,
  cors: false,
  graphiql: process.env.NODE_ENV !== 'production',
  maskedErrors: process.env.NODE_ENV === 'production',
})

const handler = route(async (request) => yoga.fetch(request), 'graphql.request')

export const GET = handler
export const POST = handler
export const OPTIONS = options
