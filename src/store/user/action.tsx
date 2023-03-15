import { call, takeEvery, put } from "redux-saga/effects";
import * as sentry from '@sentry/react'
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
import * as authAPI from '../../services/auth'
import { uploadImage, TUploadResponse } from "../../services/misc"
import { USER_TOKEN_KEY } from "../../constants/storage"
import mixpanel from "mixpanel-browser"
import { updateToken } from "../../services/ajax";
import profile from "../../utils/profile";
import { notifications } from "@mantine/notifications";
import { NoSymbolIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

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

  const loadingToastId = toast.loading('Loading')

  try {
    const response: TUserState = yield call(authAPI.githubLogin, code)
    yield call(postLogin, response, action.navigate)
    toast.success('logged in', { id: loadingToastId })
  } catch (e: any) {
    toast.error(e.toString(), { id: loadingToastId })
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
  // notifications.show({
  //   icon: (<NoSymbolIcon className="w-4 h-4" />),
  //   title: "Oops",
  //   message: e.toString(),
  // })

  toast.success(`欢迎你哦~ ${response.profile.name}`)
  mixpanel.track('login')
  yield call(navigate as any, `/dash/${response.profile.id}/home`)
}

function* loginAction(action: TLoginAction): IterableIterator<any> {
  const { email, pwd } = action

  const loadingToastId = toast.loading('Loading')
  try {
    const response = yield call(authAPI.login as any, email, pwd)
    const res = response as any
    yield call(updateToken, res.token)
    yield call(postLogin as any, response, action.navigate)
    toast.success('logged in', { id: loadingToastId })
  } catch (e: any) {
    toast.error(e.toString(), { id: loadingToastId })
  }
}

function* signupAction(action: TSignupAction) {

  const { signup } = action
  const loadingToastId = toast.loading('Loading')

  try {
    const uploadedResponse: TUploadResponse = yield call(uploadImage, signup.avatarFile)

    yield call(authAPI.signup, {
      email: signup.email.trim(),
      pwd: signup.pwd.trim(),
      name: signup.name.trim(),
      avatarUrl: uploadedResponse.filePath,
      fp: Math.random().toString()
    })

    toast.success('请去邮箱确认', { id: loadingToastId, duration: 10_000 })
    // yield call(swal, {
    //   title: '',
    //   text: `欢迎你哦~ ${signup.name}，现在需要去邮箱点一下刚刚发你的确认邮件。\n 如果有问题可以发邮件： iamhele1994@gmail.com`,
    //   icon: 'success'
    // })

    mixpanel.track('signup', {
      email: signup.email.trim(),
      name: signup.name.trim(),
      avatarUrl: uploadedResponse.filePath,
    })

    yield call(action.navigate as any, '/auth/auth-v3')
  } catch (e: any) {
    toast.error(e.toString(), { id: loadingToastId })
  }
}

function* logoutAction(action: any) {
  profile.onLogout()
  yield put({ type: USER_LOGOUT })

  toast.success(`Bye bye`)
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
