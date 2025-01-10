'use client'
import { AUTH_LOGIN, IUserAction, TUserState, USER_LOGOUT } from './type'

const initState: TUserState = {
  profile: {
    id: 0,
    name: '',
    email: '',
    avatar: '',
    createdAt: '',
    updatedAt: '',
    wechatOpenid: '',
    domain: '',
    bio: ''
  },
  token: ''
}

function userReducer(state = initState, action: IUserAction): TUserState {
  switch (action.type) {
  case AUTH_LOGIN:
    return {
      profile: action.profile,
      token: action.token
    }
  case USER_LOGOUT:
    return initState
  default:
    return state
  }
}

export default userReducer
