import type { ClippingInput } from '@/gql/graphql'

import type { TClippingItem } from './parser'

export function toClippingInput(item: TClippingItem): ClippingInput {
  return {
    bookID: item.bookId,
    content: item.content,
    createdAt: item.createdAt,
    pageAt: item.pageAt,
    title: item.title,
  }
}

export function extraFile(file: DataTransferItem): Promise<string> {
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
