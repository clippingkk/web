import { all } from "@redux-saga/core/effects";
import { login } from './user/action'

export default function* rootSaga() {
  console.log('root saga')
  yield all([
    login()
  ])
}
