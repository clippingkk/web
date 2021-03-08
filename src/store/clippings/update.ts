import { UPDATE_CLIPPING_BOOK, TClippingBookUpdateAction } from "./type";
import { takeLatest, call } from "@redux-saga/core/effects";
import { updateClippingBook } from "../../services/books";
import updateClippingBookIdMutation from '../../schema/updateClippingBook.graphql'
import swal from "sweetalert";
import { client } from "../../services/ajax";
import { updateClippingBookId, updateClippingBookIdVariables } from "../../schema/__generated__/updateClippingBookId";

export function* doUpdateClipping() {
  yield takeLatest(UPDATE_CLIPPING_BOOK, updateClippingBookSaga)
}

function* updateClippingBookSaga(action: TClippingBookUpdateAction) {
  const { clippingId } = action

  // @ts-ignore
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

  if (!bookId || bookId.length < 3) {
    return
  }

  yield client.mutate<updateClippingBookId, updateClippingBookIdVariables>({
    mutation: updateClippingBookIdMutation,
    variables: {
      cid: clippingId,
      doubanId: ~~bookId
    }
  })

  swal({
    title: '更新成功！',
    icon: 'success'
  })

  client.resetStore()

  // try {
  //   const result = yield call(updateClippingBook, clippingId, bookId)
  // } catch (e) {
  //   console.error(e)
  // }
}
