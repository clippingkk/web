import mixpanel from "mixpanel-browser"
import * as sentry from '@sentry/react'
import { useEffect } from "react"
import profile from "../utils/profile"
import { ApolloError, MutationResult } from "@apollo/client"
import { auth_auth } from "../schema/__generated__/auth"
import { useDispatch } from "react-redux"
import { AUTH_LOGIN } from "../store/user/type"
import { signup } from "../schema/__generated__/signup"
import { updateToken } from "../services/ajax"
import { authByPhone_authByPhone } from "../schema/mutations/__generated__/authByPhone"
import { USER_TOKEN_KEY } from "../constants/storage"
import { useRouter } from "next/router"
import { authByWeb3_loginByWeb3 } from "../schema/__generated__/authByWeb3"
import { loginByApple, loginByApple_loginByApple } from "../schema/auth/__generated__/loginByApple"
import { bindAppleUnique_bindAppleUnique } from "../schema/auth/__generated__/bindAppleUnique"
import { bindWeb3Address_bindWeb3Address } from "../schema/__generated__/bindWeb3Address"
import { doLoginV3_loginV3 } from "../schema/auth/__generated__/doLoginV3"
import toast from "react-hot-toast"

export function useAuthBy3rdPartSuccessed(
  called: boolean,
  loading: boolean,
  error?: ApolloError,
  authResponse?: authByWeb3_loginByWeb3 | loginByApple_loginByApple | bindAppleUnique_bindAppleUnique | bindWeb3Address_bindWeb3Address
) {
  // const navigate = useNavigate()
  const { push: navigate } = useRouter()
  const dispatch = useDispatch()
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

    localStorage.setItem(USER_TOKEN_KEY, JSON.stringify({
      profile: authResponse.user,
      token: authResponse.token,
      createdAt: Date.now()
    }))
    sessionStorage.setItem('token', authResponse.token)
    sessionStorage.setItem('uid', authResponse.user.id.toString())

    profile.token = authResponse.token
    profile.uid = authResponse.user.id
    const me = authResponse.user
    sentry.setUser({
      email: me.email,
      id: me.id.toString(),
      username: me.name
    })
    mixpanel.identify(me.id.toString())
    mixpanel.track('login')
    updateToken(profile.token)
    dispatch({ type: AUTH_LOGIN, profile: me, token: profile.token })
    // redirect
    mixpanel.track('login')
    setTimeout(() => {
      const domain = me.domain.length > 2 ? me.domain : me.id
      navigate(`/dash/${domain}/home?from_auth=1`)
    }, 0)
  }, [called, loading, error, authResponse, dispatch, navigate])
}

export function useLoginV3Successed(
  called: boolean,
  loading: boolean,
  error?: ApolloError,
  authResponse?: doLoginV3_loginV3
) {
  const { push: navigate } = useRouter()
  const dispatch = useDispatch()
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

    localStorage.setItem(USER_TOKEN_KEY, JSON.stringify({
      profile: authResponse.user,
      token: authResponse.token,
      createdAt: Date.now()
    }))
    sessionStorage.setItem('token', authResponse.token)
    sessionStorage.setItem('uid', authResponse.user.id.toString())

    profile.token = authResponse.token
    profile.uid = authResponse.user.id
    const me = authResponse.user
    sentry.setUser({
      email: me.email,
      id: me.id.toString(),
      username: me.name
    })
    mixpanel.identify(me.id.toString())
    mixpanel.track('loginV3')
    updateToken(profile.token)
    dispatch({ type: AUTH_LOGIN, profile: me, token: profile.token })
    // redirect
    mixpanel.track('loginV3')
    setTimeout(() => {
      const domain = me.domain.length > 2 ? me.domain : me.id
      navigate(`/dash/${domain}/${authResponse.isNewUser ? 'newbie' : 'home'}?from_auth=1`)
    }, 0)
  }, [called, loading, error, authResponse, dispatch, navigate])
}

export function useAuthByPhoneSuccessed(
  called: boolean,
  loading: boolean,
  error?: ApolloError,
  authResponse?: authByPhone_authByPhone
) {
  // const navigate = useNavigate()
  const { push: navigate } = useRouter()
  const dispatch = useDispatch()
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
    localStorage.setItem(USER_TOKEN_KEY, JSON.stringify({
      profile: authResponse.user,
      token: authResponse.token,
      createdAt: Date.now()
    }))
    sessionStorage.setItem('token', authResponse.token)
    sessionStorage.setItem('uid', authResponse.user.id.toString())

    profile.token = authResponse.token
    profile.uid = authResponse.user.id
    const me = authResponse.user
    sentry.setUser({
      email: me.email,
      id: me.id.toString(),
      username: me.name
    })
    mixpanel.identify(me.id.toString())
    mixpanel.track('login')
    updateToken(profile.token)
    dispatch({ type: AUTH_LOGIN, profile: me, token: profile.token })
    // redirect
    mixpanel.track('login')
    setTimeout(() => {
      const domain = me.domain.length > 2 ? me.domain : me.id
      navigate(`/dash/${domain}/home?from_auth=1`)
    }, 0)
  }, [called, loading, error, authResponse])
}



export function useAuthSuccessed(
  called: boolean,
  loading: boolean,
  error?: ApolloError,
  authResponse?: auth_auth
) {
  const { push: navigate } = useRouter()
  const dispatch = useDispatch()
  useEffect(() => {
    if (called && !error && authResponse && !loading) {
      profile.token = authResponse.token
      profile.uid = authResponse.user.id
      const me = authResponse.user
      sentry.setUser({
        email: me.email,
        id: me.id.toString(),
        username: me.name
      })
      mixpanel.identify(me.id.toString())
      mixpanel.people.set({
        "$email": me.email,
        "Sign up date": me.createdAt,
        "USER_ID": me.id.toString(),
      });
      mixpanel.track('login')
      updateToken(profile.token)
      dispatch({ type: AUTH_LOGIN, profile: me, token: profile.token })
      // redirect
      setTimeout(() => {
        navigate(`/dash/${me.id}/home`)
      }, 0)
    }
  }, [called, loading, error, authResponse])
}

export function useSignupSuccess(result: MutationResult<signup>) {
  const { push: navigate } = useRouter()
  useEffect(() => {
    const { called, error, data, loading } = result
    if (called && !error && data && !loading) {
      profile.token = data.signup.token
      profile.uid = data.signup.user.id
      const me = data.signup.user
      sentry.setUser({
        email: me.email,
        id: me.id.toString(),
        username: me.name
      })
      mixpanel.identify(me.id.toString())
      mixpanel.people.set({
        "$email": me.email,
        "Sign up date": me.createdAt,
        "USER_ID": me.id.toString(),
      });
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
      navigate('/auth/auth-v2')
    }
  }, [result])
}
