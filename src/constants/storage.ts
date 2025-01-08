import { UserContent } from '../store/user/type'

export const USER_TOKEN_KEY = 'user:token'
export const STORAGE_LANG_KEY = 'ck:lang'
export type IUserToken = {
  profile: UserContent
  token: string
  createdAt: number
}
