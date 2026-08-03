import { createYoga } from 'graphql-yoga'

import { createGraphQLContext } from './context'
import { graphQLSchema } from './schema'

export const GRAPHQL_ENDPOINT = '/api/v2/graphql'

export const yoga = createYoga({
  schema: graphQLSchema,
  graphqlEndpoint: GRAPHQL_ENDPOINT,
  context: createGraphQLContext,
  cors: false,
  graphiql: process.env.NODE_ENV !== 'production',
  maskedErrors: process.env.NODE_ENV === 'production',
})
