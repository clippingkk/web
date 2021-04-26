import { navigate, useNavigate } from "@reach/router"
import mixpanel from "mixpanel-browser"
import * as sentry from '@sentry/react'
import { useEffect } from "react"
import profile from "../../utils/profile"
import { ApolloError, LazyQueryResult, MutationResult } from "@apollo/client"
import { auth, auth_auth } from "../../schema/__generated__/auth"
import { authVariables } from "../../schema/__generated__/auth"
import { useDispatch } from "react-redux"
import { AUTH_LOGIN } from "../../store/user/type"
import { signup } from "../../schema/__generated__/signup"
import swal from "sweetalert"
import { updateToken } from "../../services/ajax"

export function useAuthSuccessed(
  called: boolean,
  loading: boolean,
  error?: ApolloError,
  authResponse?: auth_auth
  ) {
  const navigate = useNavigate()
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
  const navigate = useNavigate()
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
