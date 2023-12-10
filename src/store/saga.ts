import { all } from "redux-saga/effects";
import { usersAction } from './user/action'

export default function* rootSaga() {
  yield all([
    usersAction(),
  ])
}
