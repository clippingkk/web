import { AUTH_LOGIN, IUserAction, TUserState, USER_LOGOUT } from './type'
import { USER_TOKEN_KEY, IUserToken } from '../../constants/storage'
import mixpanel from 'mixpanel-browser'
import * as sentry from '@sentry/browser'

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
  sentry.setUser({
    email: auth.profile.email,
    id: auth.profile.id.toString(),
    username: auth.profile.name
  })
  mixpanel.identify(auth.profile.id.toString())
  if (mixpanel.people) {
    mixpanel.people.set({
      "$email": auth.profile.email,
      "Sign up date": auth.createdAt,
      "USER_ID": auth.profile.name,
    });
  }

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
