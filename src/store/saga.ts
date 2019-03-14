import { all } from "@redux-saga/core/effects";
import { usersAction } from './user/action'
import { extraAndUploadAction } from "./clippings/creator";
import { doUpdateClipping } from "./clippings/update";

export default function* rootSaga() {
  yield all([
    usersAction(),
    extraAndUploadAction(),
    doUpdateClipping()
  ])
}
