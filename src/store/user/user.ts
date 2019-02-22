import { AUTH_LOGIN, IUserAction, TUserState, USER_LOGOUT } from './type'
import { USER_TOKEN_KEY, IUserToken } from '../../constants/storage';

const initState: TUserState = {
  profile: {
    id: 0,
    name: '',
    email: '',
    avatar: ''
  },
  token: ''
}

function parseFromLS() {
  const authInfo = localStorage.getItem(USER_TOKEN_KEY)
  if (!authInfo) {
    return
  }

  const auth: IUserToken = JSON.parse(authInfo)
  // TODO: check createdAt
  sessionStorage.setItem('token', auth.token)
  sessionStorage.setItem('uid', auth.profile.id.toString())

  initState.profile = auth.profile
  initState.token = auth.token
}

parseFromLS()

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
