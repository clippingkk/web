import { UPDATE_CLIPPING_BOOK, TClippingBookUpdateAction } from "./type";
import { takeLatest, call } from "@redux-saga/core/effects";
import { updateClippingBook } from "../../services/books";
import swal from "sweetalert";

export function* doUpdateClipping() {
  yield takeLatest(UPDATE_CLIPPING_BOOK, updateClippingBookSaga)
}

function* updateClippingBookSaga(action: TClippingBookUpdateAction) {

  const { clippingId } = action

  const bookId = yield swal({
    title: "请输入本书 豆瓣 id",
    content: {
      element: "input",
      attributes: {
        placeholder: "豆瓣id",
        type: "number"
      }
    }
  })

  try {
    const result = yield call(updateClippingBook, clippingId, bookId)
  } catch (e) {
    console.error(e)
  }
}
