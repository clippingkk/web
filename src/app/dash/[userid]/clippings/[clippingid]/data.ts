import 'server-only'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { FetchClippingDocument } from '@/gql/graphql'
import { serverQuery } from '@/server/data/query'
import { getWenquBookByDbId, isValidDoubanId } from '@/services/wenqu'

/**
 * The clipping and its book, shared by the page, its metadata and the social
 * image. A private or missing clipping renders not-found.
 */
export const getClippingPage = cache(async (clippingId: number | null) => {
  if (clippingId === null) notFound()
  const { clipping } = await serverQuery(FetchClippingDocument, {
    id: clippingId,
  })
  const book = isValidDoubanId(clipping.bookID)
    ? await getWenquBookByDbId(clipping.bookID).catch(() => null)
    : null
  return { clipping, book }
})
