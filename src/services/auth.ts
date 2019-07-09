import { request, IBaseResponseData } from './ajax'
import { UserContent, TUserSignupData } from '../store/user/type'
import { IHttpClippingItem, IClippingItem } from './clippings';

interface ILoginResponse extends IBaseResponseData {
  data: {
    profile: UserContent,
    token: string
  }
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

export function login(email: string, pwd: string): Promise<ILoginResponse> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, pwd })
  })
}

export function signup(signupData: TUserSignupData): Promise<any> {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(signupData)
  })
}

export function githubLogin(code: string): Promise<ILoginResponse> {
  return request('/auth/github', {
    method: 'POST',
    body: JSON.stringify({ code })
  })
}

export async function getUserProfile(userid: string): Promise<IUserProfile> {
  const resp = await request(`/auth/${userid}`) as IUserProfileResponse
  return {
    ...resp,
    clippings: resp.clippings.map(item => ({ ...item, createdAt: new Date(item.createdAt) } as IClippingItem))
  }
}
