import type { ApolloClient } from '@apollo/client'
import * as sentry from '@sentry/react'
import Cookies from 'js-cookie'
import mixpanel from 'mixpanel-browser'
import {
  ProfileDocument,
  type ProfileQuery,
  type ProfileQueryVariables,
} from '@/gql/graphql'
import {
  COOKIE_TOKEN_KEY,
  type IUserToken,
  USER_ID_KEY,
} from '../constants/storage'
import { updateToken } from '../services/ajax'
import profile from './profile'

export async function initParseFromLS(ac: ApolloClient) {
  if (typeof localStorage === 'undefined') {
    return
  }

  let authInfo = localStorage.getItem(COOKIE_TOKEN_KEY)
  if (!authInfo) {
    // try to parse from cookies
    const cookieToken = Cookies.get(COOKIE_TOKEN_KEY)
    const uid = Cookies.get(USER_ID_KEY)
    if (!cookieToken || !uid) {
      return
    }
    updateToken(cookieToken)
    try {
      const ps = await ac.query<ProfileQuery, ProfileQueryVariables>({
        query: ProfileDocument,
        variables: {
          id: ~~uid,
        },
      })
      const payload = {
        profile: ps.data?.me ?? null,
        token: cookieToken,
        createdAt: Date.now(),
      }
      const payloadString = JSON.stringify(payload)
      localStorage.setItem(COOKIE_TOKEN_KEY, payloadString)
      authInfo = payloadString
    } catch {
      // any error occurs, just erase cookies and local storage.
      localStorage.removeItem(COOKIE_TOKEN_KEY)
      Cookies.remove(COOKIE_TOKEN_KEY)
      Cookies.remove(USER_ID_KEY)
      profile.onLogout()
    }
    if (!authInfo) {
      return
    }
  }

  const auth: IUserToken = JSON.parse(authInfo)
  // TODO: check createdAt
  sessionStorage.setItem(COOKIE_TOKEN_KEY, auth.token)
  sessionStorage.setItem(USER_ID_KEY, auth.profile.id.toString())
  sentry.setUser({
    email: auth.profile.email,
    id: auth.profile.id.toString(),
    username: auth.profile.name,
  })
  mixpanel.identify(auth.profile.id.toString())
  if (mixpanel.people) {
    mixpanel.people.set({
      $email: auth.profile.email,
      'Sign up date': auth.createdAt,
      USER_ID: auth.profile.name,
    })
  }

  // 存量数据里没这个字段，这里加一下 patch
  if (typeof auth.profile.domain !== 'string') {
    auth.profile.domain = ''
  }

  return {
    profile: auth.profile,
    token: auth.token,
  }
}
