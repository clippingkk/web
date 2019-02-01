import { all } from "@redux-saga/core/effects";
import { login } from './user/action'

export default function* rootSaga() {
  yield all([
    login()
  ])
}
