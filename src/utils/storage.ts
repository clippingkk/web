import mixpanel from 'mixpanel-browser'
import * as sentry from '@sentry/react'
import { IUserToken, USER_TOKEN_KEY } from '../constants/storage'
import Cookies from 'js-cookie'
import { updateToken } from '../services/ajax'
import { ProfileDocument, ProfileQuery, ProfileQueryVariables } from '../schema/generated'
import profile from './profile'
import { ApolloClient } from '@apollo/client'

export async function initParseFromLS(ac: ApolloClient<object>) {
  if (typeof localStorage === 'undefined') {
    return
  }

  let authInfo = localStorage.getItem(USER_TOKEN_KEY)
  if (!authInfo) {
    // try to parse from cookies
    const cookieToken = Cookies.get('token')
    const uid = Cookies.get('uid')
    if (!cookieToken || !uid) {
      return
    }
    updateToken(cookieToken)
    try {
      const ps = await ac.query<ProfileQuery, ProfileQueryVariables>({
        query: ProfileDocument,
        variables: {
          id: ~~uid
        }
      })
      const payload = {
        profile: ps.data.me,
        token: cookieToken,
        createdAt: Date.now()
      }
      const payloadString = JSON.stringify(payload)
      localStorage.setItem(USER_TOKEN_KEY, payloadString)
      authInfo = payloadString
    } catch (e) {
      // any error occurs, just erase cookies and local storage.
      localStorage.removeItem(USER_TOKEN_KEY)
      Cookies.remove('token')
      Cookies.remove('uid')
      profile.onLogout()
    }
    if (!authInfo) {
      return
    }
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
      '$email': auth.profile.email,
      'Sign up date': auth.createdAt,
      'USER_ID': auth.profile.name,
    })
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
