import { call, takeEvery, put } from "@redux-saga/core/effects";
import { navigate } from '@reach/router'
import * as authAPI from '../../services/auth'
import { AUTH_LOGIN_ACTION, UserState, AUTH_LOGIN } from "./type";
import swal from 'sweetalert'

type TLoginAction = {
  type: string
  email: string
  pwd: string
}

function* loginAction(action: TLoginAction): IterableIterator<any> {
  console.log(action)
  const { email, pwd } = action
  try {
    const response: UserState = yield call(authAPI.login, email, pwd)
    console.log(response)

    sessionStorage.setItem('token', response.token)
    yield put({ type: AUTH_LOGIN, ...response })

    console.log('name', response.profile.name)

    yield call(swal, {
      title: '哇，登陆了',
      text: `欢迎你哦~ ${response.profile.name}`,
      icon: 'success'
    })

    yield call(navigate, `/dash/${response.profile.id}/home`)

  } catch (e) {
    console.error(e)
    swal({
      title: "Oops",
      text: e,
      icon: 'error'
    })
  }
}

export function* login(): IterableIterator<any> {
  yield takeEvery(AUTH_LOGIN_ACTION, loginAction)
}
