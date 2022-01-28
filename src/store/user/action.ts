import { call, takeEvery, put, delay } from "@redux-saga/core/effects";
import * as sentry from '@sentry/react'
import fp2 from '@fingerprintjs/fingerprintjs'
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
import { updateToken } from "../../services/ajax";
import profile from "../../utils/profile";

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
  navigate: (url: string) => void
}

type TGithubLoginAction = {
  type: string
  code: string
  navigate: (url: string) => void
}

type TSignupAction = {
  type: string
  signup: TUserSignupDataInput
  navigate: (url: string) => void
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
    yield call(postLogin, response, action.navigate)
  } catch (e: any) {
    swal({
      title: "Oops",
      text: e.toString(),
      icon: 'error'
    })
  }
}

function* postLogin(response: TUserState, navigate: (url: string) => void) {
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

  mixpanel.track('login')

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
    const response = yield call(authAPI.login as any, email, pwd)
    const res = response as any
    yield call(updateToken, res.token)
    yield call(postLogin as any, response, action.navigate)
  } catch (e: any) {
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


  try {
    const uploadedResponse: TUploadResponse = yield call(uploadImage, signup.avatarFile)

    yield call(authAPI.signup, {
      email: signup.email.trim(),
      pwd: signup.pwd.trim(),
      name: signup.name.trim(),
      avatarUrl: uploadedResponse.filePath,
      fp: Math.random().toString()
    })

    yield call(swal, {
      title: '请去邮箱确认',
      text: `欢迎你哦~ ${signup.name}，现在需要去邮箱点一下刚刚发你的确认邮件。\n 如果有问题可以发邮件： iamhele1994@gmail.com`,
      icon: 'success'
    })

    mixpanel.track('signup', {
      email: signup.email.trim(),
      name: signup.name.trim(),
      avatarUrl: uploadedResponse.filePath,
    })

    yield call(action.navigate as any, '/auth/signin')
  } catch (e: any) {
    swal({
      title: "Oops",
      text: e.toString(),
      icon: 'error'
    })
  }
}

function* logoutAction(action: any) {
  profile.onLogout()
  yield put({ type: USER_LOGOUT })
  yield call(swal, {
    title: 'Logout',
    text: '下次再见哦~',
    icon: 'info'
  })
  mixpanel.track("logout")
  yield call(action.navigate as any, '/')
}

export function plainLogout() {
  profile.onLogout()
  mixpanel.track("logout")
}

export function* usersAction(): IterableIterator<any> {
  yield takeEvery(AUTH_LOGIN_ACTION, loginAction)
  yield takeEvery(USER_SIGNUP_ACTION, signupAction)
  yield takeEvery(USER_LOGOUT_ACTION, logoutAction)
  yield takeEvery(AUTH_GITHUB_ACTION, githubLoginAction)
}
