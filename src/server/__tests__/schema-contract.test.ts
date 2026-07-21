// @vitest-environment node

import { graphql } from 'graphql'

import schema from '@/schema/schema.json'
import { graphQLSchema } from '@/server/graphql/schema'

const queryFields = new Set(
  schema.__schema.types
    .find((type) => type.name === 'Query')
    ?.fields?.map((field) => field.name)
)
const mutationFields = new Set(
  schema.__schema.types
    .find((type) => type.name === 'Mutation')
    ?.fields?.map((field) => field.name)
)

test('keeps the legacy GraphQL entry points', () => {
  for (const field of ['auth', 'books', 'clipping', 'me', 'public', 'search']) {
    expect(queryFields).toContain(field)
  }
  for (const field of [
    'signup',
    'createClippings',
    'createComment',
    'exportData',
    'claimAPIKey',
  ]) {
    expect(mutationFields).toContain(field)
  }
})

test('builds an executable GraphQL schema', async () => {
  const result = await graphql({
    schema: graphQLSchema,
    source: '{ __typename }',
  })

  expect(result.errors).toBeUndefined()
  expect(result.data).toEqual({ __typename: 'Query' })
})
