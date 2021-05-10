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
  bio: string
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

export function toLogin(email: string, pwd: string) {
  return {
    type: AUTH_LOGIN_ACTION,
    email, pwd
  }
}

export function toSignup(
  signupData: TUserSignupDataInput
) {
  return {
    type: USER_SIGNUP_ACTION,
    signup: signupData
  }
}

export function toGithubLogin(code: string) {
  return {
    type: AUTH_GITHUB_ACTION,
    code
  }
}

export function execLogout() {
  return { type: USER_LOGOUT_ACTION }
}

