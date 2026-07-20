import { addResolversToSchema } from '@graphql-tools/schema'
import { buildClientSchema, type IntrospectionQuery } from 'graphql'

import introspection from '@/schema/schema.json'

import { resolvers } from './resolvers'

export const graphQLSchema = addResolversToSchema({
  schema: buildClientSchema(introspection as unknown as IntrospectionQuery),
  resolvers,
  updateResolversInPlace: true,
})
