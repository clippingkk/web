import { AUTH_LOGIN, IUserAction, TUserState } from './type'

const initState: TUserState = {
  profile: {
    id: 0,
    name: '',
    email: '',
    avatar: ''
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
    default:
      return state
  }
}

export default userReducer
