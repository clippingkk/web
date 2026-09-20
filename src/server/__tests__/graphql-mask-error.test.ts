// @vitest-environment node

import { GraphQLError } from 'graphql'

import { ApiError } from '../errors'
import { maskError } from '../graphql/yoga'

const GENERIC = 'Unexpected error.'

test('keeps an ApiError thrown from a resolver readable, with its code', () => {
  // graphql-js wraps whatever a resolver throws, putting it on originalError.
  const masked = maskError(
    new GraphQLError('user not found', {
      originalError: new ApiError('user not found', 404, 'NOT_FOUND'),
    }),
    GENERIC
  )

  expect(masked.message).toBe('user not found')
  expect((masked as GraphQLError).extensions).toMatchObject({
    code: 'NOT_FOUND',
    http: { status: 404 },
  })
})

test('keeps an ApiError raised while building the context', () => {
  // createGraphQLContext builds this shape by hand.
  const masked = maskError(
    new GraphQLError('Sign in again', {
      originalError: new ApiError('Sign in again', 401, 'UNAUTHORIZED'),
      extensions: { code: 'UNAUTHORIZED', http: { status: 401 } },
    }),
    GENERIC
  )

  expect(masked.message).toBe('Sign in again')
  expect((masked as GraphQLError).extensions).toMatchObject({
    code: 'UNAUTHORIZED',
  })
})

test('unwraps a bare ApiError that never reached graphql-js', () => {
  const masked = maskError(new ApiError('nope', 403, 'FORBIDDEN'), GENERIC)

  expect(masked.message).toBe('nope')
  expect((masked as GraphQLError).extensions).toMatchObject({
    code: 'FORBIDDEN',
    http: { status: 403 },
  })
})

test.each([
  new Error('connect ECONNREFUSED 10.0.0.1:5432'),
  new GraphQLError('select * from users failed', {
    originalError: new Error('select * from users failed'),
  }),
])('still masks an unexpected error (%s)', (error) => {
  const masked = maskError(error, GENERIC)

  expect(masked.message).toBe(GENERIC)
  expect(masked.message).not.toContain('users')
})
