import type { ApolloClient } from '@apollo/client'

import {
  ProfileDocument,
  type ProfileQuery,
  type ProfileQueryVariables,
} from '@/gql/graphql'

import profile from './profile'
export async function initParseFromLS(ac: ApolloClient) {
  if (typeof window === 'undefined') return
  profile.onLogout()
  const response = await fetch('/api/auth/session', { cache: 'no-store' })
  if (!response.ok) throw new Error('Session unavailable')
  const { data } = (await response.json()) as {
    data: { userId: number } | null
  }
  if (!data) return
  profile.uid = data.userId
  const result = await ac.query<ProfileQuery, ProfileQueryVariables>({
    query: ProfileDocument,
    variables: { id: data.userId },
    fetchPolicy: 'network-only',
  })
  return { profile: result.data!.me, token: '' }
}
