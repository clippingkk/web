export const AUTH_LOGIN = 'auth.AUTH_LOGIN'
export const AUTH_LOGIN_ACTION = 'auth.saga.AUTH_LOGIN_ACTION'
export const USER_LOGOUT = 'auth.USER_LOGOUT'
export const USER_LOGOUT_ACTION = 'auth.saga.USER_LOGOUT_ACTION'

export type UserContent = {
    id: number
    name: string
    email: string
    avatar: string
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


export function toLogin(email: string, pwd: string) {
  return {
    type: AUTH_LOGIN_ACTION,
    email, pwd
  }
}

export function execLogout() {
  return { type: USER_LOGOUT_ACTION }
}

