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
