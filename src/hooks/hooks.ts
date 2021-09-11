import mixpanel from "mixpanel-browser"
import * as sentry from '@sentry/react'
import { useEffect } from "react"
import profile from "../utils/profile"
import { ApolloError, MutationResult } from "@apollo/client"
import { auth_auth } from "../schema/__generated__/auth"
import { useDispatch } from "react-redux"
import { AUTH_LOGIN } from "../store/user/type"
import { signup } from "../schema/__generated__/signup"
import swal from "sweetalert"
import { updateToken } from "../services/ajax"
import { authByPhone_authByPhone } from "../schema/mutations/__generated__/authByPhone"
import { USER_TOKEN_KEY } from "../constants/storage"
import { useRouter } from "next/router"

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
    mixpanel.people.set({
      "$email": me.email,
      "Sign up date": me.createdAt,
      "USER_ID": me.id.toString(),
    });
    mixpanel.track('login')
    updateToken(profile.token)
    dispatch({ type: AUTH_LOGIN, profile: me, token: profile.token })
    // redirect
    mixpanel.track('login')
    setTimeout(() => {
      navigate(`/dash/${me.id}/home?from_auth=1`)
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
      swal({
        title: '请去邮箱确认',
        text: `欢迎你哦~ ${me.name}，现在需要去邮箱点一下刚刚发你的确认邮件。\n 如果有问题可以发邮件： iamhele1994@gmail.com`,
        icon: 'success'
      }).then(() => {
        navigate('/auth/signin')
      })
    }
  }, [result])
}
