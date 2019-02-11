import { call, takeEvery, put } from "@redux-saga/core/effects";
import { navigate } from '@reach/router'
import * as authAPI from '../../services/auth'
import { AUTH_LOGIN_ACTION, TUserState, AUTH_LOGIN, USER_LOGOUT_ACTION, USER_LOGOUT } from "./type";
import swal from 'sweetalert'

type TLoginAction = {
  type: string
  email: string
  pwd: string
}

function* loginAction(action: TLoginAction): IterableIterator<any> {
  const { email, pwd } = action
  try {
    const response: TUserState = yield call(authAPI.login, email, pwd)

    sessionStorage.setItem('token', response.token)
    sessionStorage.setItem('uid', response.profile.id.toString())
    yield put({ type: AUTH_LOGIN, ...response })

    yield call(swal, {
      title: '哇，登陆了',
      text: `欢迎你哦~ ${response.profile.name}`,
      icon: 'success'
    })

    yield call(navigate, `/dash/${response.profile.id}/home`)
  } catch (e) {
    swal({
      title: "Oops",
      text: e.toString(),
      icon: 'error'
    })
  }
}

function* logoutAction() {
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('uid')
  yield put({ type: USER_LOGOUT })
  yield call(swal, {
    title: 'Logout',
    text: '下次再见哦~',
    icon: 'info'
  })
  yield call(navigate, '/')
}

export function* usersAction(): IterableIterator<any> {
  yield takeEvery(AUTH_LOGIN_ACTION, loginAction)
  yield takeEvery(USER_LOGOUT_ACTION, logoutAction)
}
