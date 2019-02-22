import { UserContent } from "../store/user/type";

export const USER_TOKEN_KEY = 'user:token'
export type IUserToken = {
  profile: UserContent
  token: string
  createdAt: number
}
