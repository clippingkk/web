import { request, IBaseResponseData } from './ajax'
import { UserContent, TUserSignupData } from '../store/user/type'

interface ILoginResponse extends IBaseResponseData {
  data: {
    profile: UserContent,
    token: string
  }
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
