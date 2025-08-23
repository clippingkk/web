import type { Metadata } from 'next'
import type { Clipping, User } from '@/gql/graphql'
import logo from '../../assets/logo.png'
import { APP_URL_ORIGIN } from '../../constants/config'
import type { WenquBook } from '../../services/wenqu'

type OGWithClippingProps = {
  clipping?: Pick<Clipping, 'id' | 'title' | 'content'> & {
    creator: Pick<User, 'id' | 'name'>
  }
  book: WenquBook | null
}

export function generateMetadata(props: OGWithClippingProps): Metadata {
  const url = `${APP_URL_ORIGIN}/dash/${props.clipping?.creator.id}/clippings/${props.clipping?.id}?iac=0`

  const bookTitle = props.book?.title ?? props.clipping?.title
  const metaTitle = `${bookTitle} - ${props.clipping?.creator.name} 的书摘录 - clippingkk`

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _logoLink = props.book?.image ?? APP_URL_ORIGIN + logo.src

  return {
    metadataBase: new URL(APP_URL_ORIGIN),
    title: metaTitle,
    description: props.clipping?.content ?? '',
    openGraph: {
      url,
      type: 'website',
      title: metaTitle,
      description: props.clipping?.content ?? '',
      siteName: 'ClippingKK',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@ClippingKK',
      creator: props.clipping?.creator.name ?? '',
      title: metaTitle,
      description: props.clipping?.content ?? '',
    },
  }
}
