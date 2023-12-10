import { call, takeEvery, put } from "redux-saga/effects";
import {
  USER_LOGOUT_ACTION,
  USER_LOGOUT,
} from "./type";
import mixpanel from "mixpanel-browser"
import profile from "../../utils/profile";
import { toast } from "react-hot-toast";

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
  yield takeEvery(USER_LOGOUT_ACTION, logoutAction)
}
