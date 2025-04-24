'use client'
import mixpanel from 'mixpanel-browser'
import * as sentry from '@sentry/react'
import { useEffect } from 'react'
import profile from '../utils/profile'
import { ApolloError, MutationResult } from '@apollo/client'
import { updateToken } from '../services/ajax'
import { USER_TOKEN_KEY } from '../constants/storage'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { AuthByPhoneMutation, AuthByWeb3Query, AuthQuery, DoLoginV3Mutation, SignupMutation } from '../schema/generated'
import { syncLoginStateToServer } from '../actions/login'
import { User } from '@/gql/graphql'

type UserContent = Pick<User, 'id' | 'name' | 'email' | 'avatar' | 'createdAt'>

async function onAuthEnd(data: { user: UserContent, token: string }) {
  const { user, token } = data
  await syncLoginStateToServer({ uid: user.id, token: token })
  localStorage.setItem(USER_TOKEN_KEY, JSON.stringify({
    profile: user,
    token: token,
    createdAt: Date.now()
  }))
  sessionStorage.setItem('token', token)
  sessionStorage.setItem('uid', user.id.toString())

  profile.token = token
  profile.uid = user.id
  const me = user
  sentry.setUser({
    email: me.email,
    id: me.id.toString(),
    username: me.name
  })
  mixpanel.identify(me.id.toString())
  mixpanel.people.set({
    '$email': me.email,
    'Sign up date': me.createdAt,
    'USER_ID': me.id.toString(),
  })
  updateToken(profile.token)
  // Cookies.set('token', profile.token, { expires: 365 })
  // Cookies.set('uid', profile.uid.toString(), { expires: 365 })
}

export function useAuthBy3rdPartSuccessed(
  called: boolean,
  loading: boolean,
  error?: ApolloError,
  // authResponse?: authByWeb3_loginByWeb3 | loginByApple_loginByApple | bindAppleUnique_bindAppleUnique | bindWeb3Address_bindWeb3Address
  authResponse?: Pick<AuthByWeb3Query['loginByWeb3'], 'user' | 'token'>
) {
  // const navigate = useNavigate()
  const { push: navigate } = useRouter()
  useEffect(() => {
    if (!called) {
      return
    }
    if (error) {
      return
    }
    if (loading) {
      return
    }
    if (!authResponse) {
      return
    }

    if (authResponse.user.id === 0) {
      return
    }

    onAuthEnd(authResponse).then(() => {
      mixpanel.track('login')
      // redirect
      setTimeout(() => {
        const me = authResponse.user
        const domain = me.domain.length > 2 ? me.domain : me.id
        navigate(`/dash/${domain}/home?from_auth=1`)
      }, 100)
    })
  }, [called, loading, error, authResponse, navigate])
}

export function useLoginV3Successed(
  called: boolean,
  loading: boolean,
  error?: ApolloError,
  authResponse?: DoLoginV3Mutation['loginV3']
) {
  const { push: navigate } = useRouter()
  useEffect(() => {
    if (!called) {
      return
    }
    if (error) {
      return
    }
    if (loading) {
      return
    }
    if (!authResponse) {
      return
    }

    if (authResponse.user.id === 0) {
      return
    }

    onAuthEnd(authResponse).then(() => {
      mixpanel.track('loginV3')
      // redirect
      setTimeout(() => {
        const me = authResponse.user
        const domain = me.domain.length > 2 ? me.domain : me.id
        navigate(`/dash/${domain}/${authResponse.isNewUser ? 'newbie' : 'home'}?from_auth=1`)
      }, 100)
    })
  }, [called, loading, error, authResponse, navigate])
}

export function useAuthByPhoneSuccessed(
  called: boolean,
  loading: boolean,
  error?: ApolloError,
  authResponse?: AuthByPhoneMutation['authByPhone']
) {
  // const navigate = useNavigate()
  const { push: navigate } = useRouter()
  useEffect(() => {
    if (!called) {
      return
    }
    if (error) {
      return
    }
    if (loading) {
      return
    }
    if (!authResponse) {
      return
    }

    onAuthEnd(authResponse).then(() => {
      mixpanel.track('login')
      // redirect
      setTimeout(() => {
        const me = authResponse.user
        const domain = me.domain.length > 2 ? me.domain : me.id
        navigate(`/dash/${domain}/home?from_auth=1`)
      }, 100)
    })
  }, [called, loading, error, authResponse])
}

export function useAuthSuccessed(
  called: boolean,
  loading: boolean,
  error?: ApolloError,
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
  }, [called, loading, error, authResponse])
}

export function useSignupSuccess(result: MutationResult<SignupMutation>) {
  const { push: navigate } = useRouter()
  useEffect(() => {
    const { called, error, data, loading } = result
    if (called && !error && data && !loading) {
      onAuthEnd(data.signup)
      const me = data.signup.user
      mixpanel.track('signup', {
        email: me.email,
        name: me.name,
        avatarUrl: me.avatar,
      })
      // redirect
      toast.success(
        `欢迎你哦~ ${me.name}，现在需要去邮箱点一下刚刚发你的确认邮件。\n 如果有问题可以发邮件： iamhele1994@gmail.com`,
        {
          duration: 10_000
        }
      )
      navigate('/auth/auth-v4')
    }
  }, [result])
}