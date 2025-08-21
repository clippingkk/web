export const COOKIE_TOKEN_KEY = 'ck-token'
export const USER_ID_KEY = 'ck-uid'
export const STORAGE_LANG_KEY = 'ck-lang'
export type IUserToken = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: any
  token: string
  createdAt: number
}
