// @vitest-environment node
import { ApiError } from '../errors'

const { getDatabaseMock } = vi.hoisted(() => ({ getDatabaseMock: vi.fn() }))
vi.mock('../db', () => ({ getDatabase: getDatabaseMock }))

import { GRAPHQL_ENDPOINT, yoga } from '../graphql/yoga'

async function execute(query: string) {
  const response = await yoga.fetch(`http://localhost${GRAPHQL_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/graphql-response+json',
    },
    body: JSON.stringify({ query }),
  })
  return {
    status: response.status,
    body: (await response.json()) as {
      errors?: { message: string; path?: string[]; extensions?: any }[]
    },
  }
}

/** db().select(...).from(...).where(...) resolving to `rows`. */
function selectReturning(rows: unknown[]) {
  const where = vi.fn().mockResolvedValue(rows)
  getDatabaseMock.mockReturnValue({
    db: { select: () => ({ from: () => ({ where }) }) },
  })
}

beforeEach(() => getDatabaseMock.mockReset())

it.each([
  [401, 'UNAUTHORIZED'],
  [403, 'FORBIDDEN'],
  [404, 'NOT_FOUND'],
  [400, 'BAD_REQUEST'],
  [503, 'BAD_REQUEST'],
])('derives the code for a %s ApiError that names none', (status, code) => {
  expect(new ApiError('x', status).code).toBe(code)
  expect(new ApiError('x', status, 'CUSTOM').code).toBe('CUSTOM')
})

// NODE_ENV is 'test' here: masking used to be production-only, so these codes
// never reached pages in development.
it('hands pages the ApiError code outside production', async () => {
  const { status, body } = await execute('{ book(id: 1) { doubanId } }')
  expect(status).toBe(401)
  expect(body.errors?.[0]).toMatchObject({
    message: 'Unauthorized',
    path: ['book'],
    extensions: { code: 'UNAUTHORIZED' },
  })
})

it('reports a missing book as NOT_FOUND, not BAD_REQUEST', async () => {
  selectReturning([{ clippingsCount: 0 }])
  const { status, body } = await execute('{ book(id: 1, uid: 2) { doubanId } }')
  expect(status).toBe(404)
  expect(body.errors?.[0]).toMatchObject({
    message: 'book not found',
    extensions: { code: 'NOT_FOUND' },
  })
})

it('still masks an unexpected failure', async () => {
  const where = vi
    .fn()
    .mockRejectedValue(new Error('connect ECONNREFUSED 10.0.0.1:5432'))
  getDatabaseMock.mockReturnValue({
    db: { select: () => ({ from: () => ({ where }) }) },
  })
  const { status, body } = await execute('{ book(id: 1, uid: 2) { doubanId } }')
  expect(status).toBe(200)
  expect(body.errors?.[0]).toMatchObject({
    message: 'Unexpected error.',
    extensions: { code: 'INTERNAL_SERVER_ERROR' },
  })
  expect(JSON.stringify(body)).not.toContain('ECONNREFUSED')
})
