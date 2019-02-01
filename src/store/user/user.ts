import { AUTH_LOGIN, IUserAction, UserState } from './type'

const initState: UserState = {
  profile: {
    id: 0,
    name: '',
    email: '',
    avatar: ''
  },
  token: ''
}

function userReducer(state = initState, action: IUserAction): UserState {
  switch (action.type) {
    case AUTH_LOGIN:
      return action.payload
    default:
      return state
  }
}

export default userReducer
