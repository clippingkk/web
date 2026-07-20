import schema from '@/schema/schema.json'

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
