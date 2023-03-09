import { request, IBaseResponseData } from './ajax'
import { UserContent, TUserSignupData } from '../store/user/type'
import { IHttpClippingItem, IClippingItem } from './clippings';
import * as sentry from '@sentry/react'

type ILoginResponse = {
    profile: UserContent,
    token: string
}

interface IUserProfileResponse {
  user: UserContent,
  clippingsCount: number,
  clippings: IHttpClippingItem[]
}

export interface IUserProfile {
  user: UserContent,
  clippingsCount: number,
  clippings: IClippingItem[]
}

export function login(email: string, pwd: string) {
  return request<ILoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, pwd })
  }).catch(e => {
    sentry.withScope(scope => {
      scope.setExtra('API-error-type', 'login')
      sentry.captureException(e)
    })
    throw e
  })
}

export function signup(signupData: TUserSignupData): Promise<any> {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(signupData)
  }).catch(e => {
    sentry.withScope(scope => {
      scope.setExtra('API-error-type', 'signup')
      sentry.captureException(e)
    })
    throw e
  })
}

export function githubLogin(code: string): Promise<ILoginResponse> {
  return request<ILoginResponse>('/auth/github', {
    method: 'POST',
    body: JSON.stringify({ code })
  }).catch(e => {
    sentry.withScope(scope => {
      scope.setExtra('API-error-type', 'github-login')
      sentry.captureException(e)
    })
    throw e
  })
}

export async function getUserProfile(userid: string): Promise<IUserProfile> {
  const resp = await request(`/auth/${userid}`) as IUserProfileResponse
  return {
    ...resp,
    clippings: resp.clippings.map(item => ({ ...item, createdAt: new Date(item.createdAt) } as IClippingItem))
  }
}
