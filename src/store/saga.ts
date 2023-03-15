import { all } from "redux-saga/effects";
import { usersAction } from './user/action'
import { extraAndUploadAction } from "./clippings/creator";

export default function* rootSaga() {
  yield all([
    usersAction(),
    extraAndUploadAction(),
  ])
}
