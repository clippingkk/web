'use client'
import type { MutationResult } from '@apollo/client/react'
import * as sentry from '@sentry/react'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

import type { User } from '@/gql/graphql'

import { syncLoginStateToServer } from '../actions/login'
import { COOKIE_TOKEN_KEY, USER_ID_KEY } from '../constants/storage'
import type {
  AuthByPhoneMutation,
  AuthByWeb3Query,
  AuthQuery,
  DoLoginV3Mutation,
  SignupMutation,
} from '../schema/generated'
import { updateToken } from '../services/ajax'
import profile from '../utils/profile'
import { getUserSlug } from '../utils/profile.utils'

type UserContent = Pick<
  User,
  'id' | 'name' | 'email' | 'avatar' | 'createdAt' | 'domain'
>

async function onAuthEnd(data: { user: UserContent; token: string }) {
  const { user, token } = data
  await syncLoginStateToServer({ uid: user.id, token: token })
  localStorage.setItem(
    COOKIE_TOKEN_KEY,
    JSON.stringify({
      profile: user,
      token: token,
      createdAt: Date.now(),
    })
  )
  sessionStorage.setItem(COOKIE_TOKEN_KEY, token)
  sessionStorage.setItem(USER_ID_KEY, user.id.toString())

  profile.token = token
  profile.uid = user.id
  const me = user
  sentry.setUser({
    email: me.email,
    id: me.id.toString(),
    username: me.name,
  })
  updateToken(profile.token)
  // Cookies.set('token', profile.token, { expires: 365 })
  // Cookies.set('uid', profile.uid.toString(), { expires: 365 })
}

type AuthResultState<T> = {
  called: boolean
  loading: boolean
  error?: Error
  authResponse?: T
}

function useAuthResultEffect<T extends { user: UserContent; token: string }>(
  state: AuthResultState<T>,
  getRedirectPath: (response: T) => string,
  options: { skipZeroIdGuard?: boolean } = {}
) {
  const { push: navigate } = useRouter()
  const { called, loading, error, authResponse } = state
  useEffect(() => {
    if (!called || error || loading || !authResponse) {
      return
    }
    if (!options.skipZeroIdGuard && authResponse.user.id === 0) {
      return
    }

    onAuthEnd(authResponse).then(() => {
      setTimeout(() => {
        navigate(getRedirectPath(authResponse) as Route)
      }, 100)
    })
  }, [
    called,
    loading,
    error,
    authResponse,
    navigate,
    options.skipZeroIdGuard,
    getRedirectPath,
  ])
}

export function useAuthBy3rdPartSuccessed(
  called: boolean,
  loading: boolean,
  error?: Error,
  authResponse?: Pick<AuthByWeb3Query['loginByWeb3'], 'user' | 'token'>
) {
  useAuthResultEffect(
    { called, loading, error, authResponse },
    (response) => `/dash/${getUserSlug(response.user)}/home?from_auth=1`
  )
}

export function useLoginV3Successed(
  called: boolean,
  loading: boolean,
  error?: Error,
  authResponse?: DoLoginV3Mutation['loginV3']
) {
  useAuthResultEffect(
    { called, loading, error, authResponse },
    (response) =>
      `/dash/${getUserSlug(response.user)}/${
        response.isNewUser ? 'newbie' : 'home'
      }?from_auth=1`
  )
}

export function useAuthByPhoneSuccessed(
  called: boolean,
  loading: boolean,
  error?: Error,
  authResponse?: AuthByPhoneMutation['authByPhone']
) {
  useAuthResultEffect(
    { called, loading, error, authResponse },
    (response) => `/dash/${getUserSlug(response.user)}/home?from_auth=1`,
    { skipZeroIdGuard: true }
  )
}

export function useAuthSuccessed(
  called: boolean,
  loading: boolean,
  error?: Error,
  authResponse?: AuthQuery['auth']
) {
  const { push: navigate } = useRouter()
  useEffect(() => {
    if (called && !error && authResponse && !loading) {
      onAuthEnd(authResponse)
      const me = authResponse.user
      // redirect
      setTimeout(() => {
        navigate(`/dash/${me.id}/home`)
      }, 100)
    }
  }, [called, loading, error, authResponse, navigate])
}

export function useSignupSuccess(result: MutationResult<SignupMutation>) {
  const { push: navigate } = useRouter()
  useEffect(() => {
    const { called, error, data, loading } = result
    if (called && !error && data && !loading) {
      onAuthEnd(data.signup)
      const me = data.signup.user
      // redirect
      toast.success(
        `欢迎你哦~ ${me.name}，现在需要去邮箱点一下刚刚发你的确认邮件。\n 如果有问题可以发邮件： iamhele1994@gmail.com`,
        {
          duration: 10_000,
        }
      )
      navigate('/auth/auth-v4')
    }
  }, [result, navigate])
}
