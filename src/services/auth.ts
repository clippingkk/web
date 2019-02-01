import { request, IBaseResponseData } from './ajax'
import { UserContent } from '../store/user/type'

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
