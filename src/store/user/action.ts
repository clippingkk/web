import { takeLatest, call, takeEvery, put } from "@redux-saga/core/effects";
import * as authAPI from '../../services/auth'
import { AUTH_LOGIN_ACTION, UserState, AUTH_LOGIN } from "./type";

function* loginAction(action): IterableIterator<any> {
  const { email, pwd } = action
  const response: UserState = yield call(authAPI.login, email, pwd)
  console.log(response)

  sessionStorage.setItem('token', response.token)

  put({ type: AUTH_LOGIN, ...response })
}

export function* login(): IterableIterator<any> {
  yield takeEvery(AUTH_LOGIN_ACTION, loginAction)
}
