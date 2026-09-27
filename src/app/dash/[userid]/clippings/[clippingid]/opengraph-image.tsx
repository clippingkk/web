import { ImageResponse } from 'next/og'

import Logo from '@/assets/bootsplash_logo@3x.png'
import OGImageClipping from '@/components/og/image-clipping'
import { APP_URL_ORIGIN } from '@/constants/config'
import { FetchClippingDocument } from '@/gql/graphql'
import { serverQuery } from '@/server/data/query'
import { getWenquBookByDbId, isValidDoubanId } from '@/services/wenqu'

export const alt = 'A highlight shared on ClippingKK'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

type ImageProps = {
  params: Promise<{ userid: string; clippingid: string }>
}

function absolute(src: string | URL) {
  const url = new URL(src, APP_URL_ORIGIN)
  return url.href
}

async function loadClipping(clippingid: string) {
  const id = /^\d+$/.test(clippingid) ? Number(clippingid) : -1
  // Private or missing clippings get the brand card instead of an error.
  const data =
    id > 0
      ? await serverQuery(
          FetchClippingDocument,
          { id },
          { notFound: 'null', unauthorized: 'null' }
        ).catch(() => null)
      : null
  const clipping = data?.clipping
  const book =
    clipping && isValidDoubanId(clipping.bookID)
      ? await getWenquBookByDbId(clipping.bookID).catch(() => null)
      : null
  return { clipping, book }
}

async function loadFont() {
  const fontUrl = absolute(new URL('LXGWWenKai-Regular.ttf', import.meta.url))
  return fetch(fontUrl).then((res) => res.arrayBuffer())
}

export default async function Image(props: ImageProps) {
  const { clippingid } = await props.params
  // the font needs nothing from the clipping, so it downloads alongside
  const [{ clipping, book }, font] = await Promise.all([
    loadClipping(clippingid),
    loadFont(),
  ])

  return new ImageResponse(
    <OGImageClipping
      content={
        clipping?.content ?? 'ClippingKK — the passages that stayed with you.'
      }
      b={{
        title: book?.title ?? clipping?.title ?? 'ClippingKK',
        author: book?.author ?? '',
      }}
      logoSrc={absolute(Logo.src)}
    />,
    {
      ...size,
      fonts: [{ name: 'LXGWWenKai', data: font, style: 'normal', weight: 400 }],
    }
  )
}
