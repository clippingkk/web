'use client'
// Re-export everything from @apollo/client core and @apollo/client/react
// Used by codegen to provide a single import path for both core types and React hooks
export * from '@apollo/client'
export {
  useQuery,
  useMutation,
  useLazyQuery,
  useSuspenseQuery,
  useApolloClient,
  skipToken,
} from '@apollo/client/react'
export type {
  MutationResult,
  MutationHookOptions,
  QueryHookOptions,
  QueryResult,
  LazyQueryHookOptions,
  SuspenseQueryHookOptions,
  UseSuspenseQueryResult,
  SkipToken,
  MutationTuple,
} from '@apollo/client/react'

// Compat types for codegen - these were removed/moved in Apollo Client v4
// MutationFunction is now useMutation.MutationFunction
export type MutationFunction<
  TData = unknown,
  TVariables = Record<string, unknown>,
> = (
  options?: { variables?: TVariables } & Record<string, unknown>
) => Promise<{ data?: TData | null }>

// BaseMutationOptions was removed in v4
export type BaseMutationOptions<
  TData = unknown,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
> = MutationHookOptions<TData, TVariables>

// Re-export MutationHookOptions to be used as BaseMutationOptions replacement
import type { MutationHookOptions } from '@apollo/client/react'
