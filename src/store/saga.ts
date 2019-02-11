import { all } from "@redux-saga/core/effects";
import { usersAction } from './user/action'
import { extraAndUploadAction } from "./clippings/creator";

export default function* rootSaga() {
  yield all([
    usersAction(),
    extraAndUploadAction()
  ])
}
