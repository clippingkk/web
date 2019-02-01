import { takeLatest, call } from "@redux-saga/core/effects"
import { log } from '../../utils/sentry'
import { EXTRA_AND_UPLOAD_FILE_TO_SERVER, TClippingsFile } from "./type"
import { create } from "../../services/clippings";

export type TClippingItem = {
  title: string
  content: string
  pageAt: string
  bookId: string
  createdAt: string
}

export function* extraAndUploadAction() {
  yield takeLatest(EXTRA_AND_UPLOAD_FILE_TO_SERVER, extraAndUpload)
}

function extraFile(file: DataTransferItem): Promise<string> {
  return new Promise((resolve, reject) => {
    const f = new FileReader()
    f.onload = (readEvent) => {
      resolve((readEvent.target as any).result)
    }

    const uploadFile = file.getAsFile()
    if (!uploadFile) {
      reject('nil')
      return
    }

    f.readAsText(uploadFile)
  })
}

function parseData(file: string): TClippingItem[] {
  const lines = file.split('\n')
  const result: TClippingItem[] = []
  let item: TClippingItem = {} as any
  for (let i = 0; i < lines.length; i++) {
    switch (i % 5) {
      case 4:
        item.bookId = '0'
        result.push(item)
        item = {} as any
        break
      case 0:
        const title = lines[i].split(' ')[0]
        item.title = title
        break
      case 1:
        const matched = lines[i].match(/Location\ (\d+-\d+) | Added on (.*)/g)
        if (!matched || matched.length < 2) {
          log('match location error', { text: lines[i] })
          item.pageAt = ''
          item.createdAt = new Date().toISOString()
          break
        }
        item.pageAt = matched[0]
        item.createdAt = new Date(matched[1]).toISOString()
        break
      case 2:
        // space line
        break
      case 3:
        item.content = lines[i]
        break
    }
  }

  return result
}

function* extraAndUpload(action: TClippingsFile) {
  const { file } = action

  const str: string = yield call(extraFile, file)
  const parsedData: TClippingItem[] = yield call(parseData, str)

  const chunkedData = parsedData.reduce((result: (TClippingItem[])[], item: TClippingItem, index: number) => {
    if (result[result.length - 1].length % 20 === 0 && index !== 0) {
      result.push([item])
    } else {
      result[result.length - 1].push(item)
    }
    return result
  }, [[]])

  try {
    for (let i = 0; i < chunkedData.length; i++) {
      yield call(create, chunkedData[i])
    }
  } catch (e) {
    console.error(e)
  }
}
