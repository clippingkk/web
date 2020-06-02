import { call, takeEvery, put, delay } from "@redux-saga/core/effects";
import { navigate } from '@reach/router'
import * as sentry from '@sentry/browser'
import fp2 from 'fingerprintjs2'
import { sha256 } from 'js-sha256'
import {
  AUTH_LOGIN_ACTION,
  TUserState,
  AUTH_LOGIN,
  USER_LOGOUT_ACTION,
  USER_LOGOUT,
  USER_SIGNUP_ACTION,
  TUserSignupDataInput,
  AUTH_GITHUB_ACTION
} from "./type";
import swal from 'sweetalert'
import * as authAPI from '../../services/auth'
import { uploadImage, TUploadResponse } from "../../services/misc"
import { USER_TOKEN_KEY } from "../../constants/storage"
import mixpanel from "mixpanel-browser"

function mobileAlert(): Promise<any> {
  if (screen.width > 720) {
    return Promise.resolve(null)
  }
  return swal({
    title: '敬告',
    text: '手机体验很差哦，建议切换到电脑访问： https://kindle.annatarhe.com',
    icon: 'info'
  })
}

type TLoginAction = {
  type: string
  email: string
  pwd: string
}

type TGithubLoginAction = {
  type: string
  code: string
}

type TSignupAction = {
  type: string
  signup: TUserSignupDataInput
}

function* githubLoginAction(action: TGithubLoginAction) {
  const { code } = action

  swal({
    title: 'loading',
    text: 'loading',
    icon: 'info',
    buttons: [false],
    closeOnClickOutside: false,
    closeOnEsc: false,
  })

  try {
    const response: TUserState = yield call(authAPI.githubLogin, code)
    yield call(postLogin, response)
  } catch (e) {
    swal({
      title: "Oops",
      text: e.toString(),
      icon: 'error'
    })
  }
}

function* postLogin(response: TUserState) {
  localStorage.setItem(USER_TOKEN_KEY, JSON.stringify({
    profile: response.profile,
    token: response.token,
    createdAt: Date.now()
  }))

  sessionStorage.setItem('token', response.token)
  sessionStorage.setItem('uid', response.profile.id.toString())
  sentry.setUser({
    email: response.profile.email,
    id: response.profile.id.toString(),
    username: response.profile.name
  })
  mixpanel.identify(response.profile.id.toString())
  mixpanel.people.set({
    "$email": response.profile.email,
    "Sign up date": "",
    "USER_ID": response.profile.name,
  });

  yield put({ type: AUTH_LOGIN, ...response })

  yield call(swal, {
    title: '哇，登陆了',
    text: `欢迎你哦~ ${response.profile.name}`,
    icon: 'success'
  })

  yield call(navigate as any, `/dash/${response.profile.id}/home`)
}

function* loginAction(action: TLoginAction): IterableIterator<any> {
  yield call(mobileAlert)

  const { email, pwd } = action

  swal({
    title: 'loading',
    text: 'loading',
    icon: 'info',
    buttons: [false],
    closeOnClickOutside: false,
    closeOnEsc: false,
  })

  try {
    const response: TUserState = yield call(authAPI.login, email, pwd)
    yield call(postLogin, response)
  } catch (e) {
    swal({
      title: "Oops",
      text: e.toString(),
      icon: 'error'
    })
  }
}

function* signupAction(action: TSignupAction) {
  yield call(mobileAlert)

  const { signup } = action

  swal({
    title: 'loading',
    text: 'loading',
    icon: 'info',
    buttons: [false],
    closeOnClickOutside: false,
    closeOnEsc: false,
  })

  const fpResult: fp2.Component[] = yield call(fp2.getPromise, {
    excludes: {
      userAgent: true,
    }
  })

  const fp = (fpResult.find(x => x.key === 'canvas') as fp2.Component)
    .value[1].split(',')[1]

  try {
    const uploadedResponse: TUploadResponse = yield call(uploadImage, signup.avatarFile)

    yield call(authAPI.signup, {
      email: signup.email.trim(),
      pwd: signup.pwd.trim(),
      name: signup.name.trim(),
      avatarUrl: uploadedResponse.filePath,
      fp: sha256(fp).toString()
    })

    yield call(swal, {
      title: '请去邮箱确认',
      text: `欢迎你哦~ ${signup.name}，现在需要去邮箱点一下刚刚发你的确认邮件。\n 如果有问题可以发邮件： iamhele1994@gmail.com`,
      icon: 'success'
    })

    yield call(navigate as any, '/auth/signin')
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
  localStorage.removeItem(USER_TOKEN_KEY)
  yield put({ type: USER_LOGOUT })
  yield call(swal, {
    title: 'Logout',
    text: '下次再见哦~',
    icon: 'info'
  })
  mixpanel.track("user logout")
  yield call(navigate as any, '/')
}

export function* usersAction(): IterableIterator<any> {
  yield takeEvery(AUTH_LOGIN_ACTION, loginAction)
  yield takeEvery(USER_SIGNUP_ACTION, signupAction)
  yield takeEvery(USER_LOGOUT_ACTION, logoutAction)
  yield takeEvery(AUTH_GITHUB_ACTION, githubLoginAction)
}
