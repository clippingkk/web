import { UserContent } from '../store/user/type'

export const USER_TOKEN_KEY = 'user:token'
export const COOKIE_TOKEN_KEY = 'token'
export const USER_ID_KEY= 'uid'
export const STORAGE_LANG_KEY = 'ck:lang'
export type IUserToken = {
  profile: UserContent
  token: string
  createdAt: number
}
