import mixpanel from 'mixpanel-browser'
import * as sentry from '@sentry/react'
import { IUserToken, USER_TOKEN_KEY } from '../constants/storage'

export function initParseFromLS() {
  if (typeof window === 'undefined') {
    return 
  }

  const authInfo = localStorage.getItem(USER_TOKEN_KEY)
  if (!authInfo) {
    return
  }

  const auth: IUserToken = JSON.parse(authInfo)
  // TODO: check createdAt
  sessionStorage.setItem('token', auth.token)
  sessionStorage.setItem('uid', auth.profile.id.toString())
  sentry.setUser({
    email: auth.profile.email,
    id: auth.profile.id.toString(),
    username: auth.profile.name
  })
  mixpanel.identify(auth.profile.id.toString())
  if (mixpanel.people) {
    mixpanel.people.set({
      "$email": auth.profile.email,
      "Sign up date": auth.createdAt,
      "USER_ID": auth.profile.name,
    });
  }

  // 存量数据里没这个字段，这里加一下 patch
  if (typeof auth.profile.domain !== 'string') {
    auth.profile.domain = ''
  }

  return {
    profile: auth.profile,
    token: auth.token
  }
}
