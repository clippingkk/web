export const AUTH_LOGIN = 'auth.AUTH_LOGIN'
export const AUTH_LOGIN_ACTION = 'auth.saga.AUTH_LOGIN_ACTION'
export const USER_LOGOUT = 'auth.USER_LOGOUT'
export const USER_LOGOUT_ACTION = 'auth.saga.USER_LOGOUT_ACTION'
export const USER_SIGNUP = 'auth.USER_SIGNUP'
export const USER_SIGNUP_ACTION = 'auth.USER_SIGNUP_ACTION'
export const AUTH_GITHUB_ACTION = 'auth.GITHUB_LOGIN_ACTION'

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

interface TUserSignupDataBase {
  email: string
  pwd: string
  name: string
}

export interface TUserSignupDataInput extends TUserSignupDataBase {
  avatarFile: File
}

export interface TUserSignupData extends TUserSignupDataBase {
  fp: string
  avatarUrl: string
}

export function toLogin(email: string, pwd: string, navigate: (url: string) => void) {
  return {
    type: AUTH_LOGIN_ACTION,
    email, pwd,
    navigate
  }
}

export function toSignup(
  signupData: TUserSignupDataInput,
  navigate: (url: string) => void
) {
  return {
    type: USER_SIGNUP_ACTION,
    signup: signupData,
    navigate
  }
}

export function toGithubLogin(code: string, navigate: (url: string) => void) {
  return {
    type: AUTH_GITHUB_ACTION,
    code,
    navigate
  }
}

export function execLogout(navigate: (url: string) => void) {
  return { type: USER_LOGOUT_ACTION, navigate }
}

