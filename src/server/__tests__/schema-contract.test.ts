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
  for (const field of [
    'auth',
    'books',
    'bookComments',
    'clipping',
    'me',
    'public',
    'search',
  ]) {
    expect(queryFields).toContain(field)
  }
  for (const field of [
    'signup',
    'createClippings',
    'createComment',
    'createBookComment',
    'deleteBookComment',
    'exportData',
    'claimAPIKey',
  ]) {
    expect(mutationFields).toContain(field)
  }
})

test('offers obsidian alongside the other export destinations', () => {
  const destinations = schema.__schema.types
    .find((type) => type.name === 'ExportDestination')
    ?.enumValues?.map((value) => value.name)
  expect(destinations).toEqual(['flomo', 'mail', 'notion', 'obsidian'])
})

test('builds an executable GraphQL schema', async () => {
  const result = await graphql({
    schema: graphQLSchema,
    source: '{ __typename }',
  })

  expect(result.errors).toBeUndefined()
  expect(result.data).toEqual({ __typename: 'Query' })
})
