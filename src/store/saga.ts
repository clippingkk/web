import { all } from "@redux-saga/core/effects";
import { login } from './user/action'
import { extraAndUploadAction } from "./clippings/creator";

export default function* rootSaga() {
  yield all([
    login(),
    extraAndUploadAction()
  ])
}
