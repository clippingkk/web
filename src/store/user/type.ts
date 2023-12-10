export const AUTH_LOGIN = 'auth.AUTH_LOGIN'
export const USER_LOGOUT = 'auth.USER_LOGOUT'
export const USER_LOGOUT_ACTION = 'auth.saga.USER_LOGOUT_ACTION'

export type UserContent = {
  id: number
  name: string
  email: string
  avatar: string
  createdAt: string
  updatedAt: string
  wechatOpenid: string
  domain: string
  bio: string
  premiumEndAt?: string
}

export type TUserState = {
  profile: UserContent,
  token: string
}

export interface IUserAction {
  type: typeof AUTH_LOGIN | typeof USER_LOGOUT,
  profile: UserContent,
  token: string
}

export function execLogout(navigate: (url: string) => void) {
  return { type: USER_LOGOUT_ACTION, navigate }
}

