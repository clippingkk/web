import { generateMetadata as clippingGenerateMetadata } from '@/components/og/og-with-clipping'
import ClippingRichContent from '@/components/text-content/clipping-rich-content'
import { CDN_DEFAULT_DOMAIN } from '@/constants/config'
import { duration3Days } from '@/hooks/book'
import { useTranslation } from '@/i18n'
import {
  FetchClippingDocument,
  FetchClippingQuery,
  FetchClippingQueryVariables,
  ProfileDocument,
  ProfileQuery,
  ProfileQueryVariables,
} from '@/schema/generated'
import { isGrandAdmin } from '@/services/admin'
import { getReactQueryClient } from '@/services/ajax'
import { getApolloServerClient } from '@/services/apollo.server'
import { IN_APP_CHANNEL } from '@/services/channel'
import { WenquBook, wenquRequest, WenquSearchResponse } from '@/services/wenqu'
import { Metadata } from 'next'
import { cookies } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import ClippingSidebar from './clipping-sidebar'
import styles from './clipping.module.css'
import CommentContainer from './comment-container'
import Reactions from './reactions'

type PageProps = {
  params: Promise<{ clippingid: string; userid: string }>
  searchParams: Promise<{ iac: string }>
}
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { clippingid } = await props.params
  const cid = ~~clippingid

  const client = getApolloServerClient()
  const clippingsResponse = await client.query<
    FetchClippingQuery,
    FetchClippingQueryVariables
  >({
    query: FetchClippingDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: ~~cid,
    },
  })

  const rq = getReactQueryClient()
  const bookID = clippingsResponse.data.clipping.bookID
  let b: WenquBook | null = null
  if (bookID && bookID.length > 3) {
    const bs = await rq.fetchQuery({
      queryKey: ['wenqu', 'books', 'dbId', bookID],
      queryFn: () =>
        wenquRequest<WenquSearchResponse>(`/books/search?dbId=${bookID}`),
      staleTime: duration3Days,
      gcTime: duration3Days,
    })
    b = bs.books.length === 1 ? bs.books[0] : null
  }

  return clippingGenerateMetadata({
    clipping: clippingsResponse.data.clipping,
    book: b,
  })
}

async function Page(props: PageProps) {
  const { clippingid } = await props.params
  const cs = await cookies()
  const token = cs.get('token')?.value
  const uid = cs.get('uid')?.value
  const iac = (await props.searchParams).iac
  const cid = ~~clippingid
  const client = getApolloServerClient()
  const clippingsResponse = await client.query<
    FetchClippingQuery,
    FetchClippingQueryVariables
  >({
    query: FetchClippingDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: ~~cid,
    },
    context: {
      headers: token
        ? {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
        : undefined,
    },
  })

  let myProfile: ProfileQuery['me'] | undefined = undefined
  if (uid) {
    const p = await client.query<ProfileQuery, ProfileQueryVariables>({
      query: ProfileDocument,
      variables: {
        id: ~~uid,
      },
      context: {
        headers: token
          ? {
            Authorization: 'Bearer ' + token,
          }
          : undefined,
      },
    })
    myProfile = p.data.me
  }

  let bookData: WenquBook | null = null
  const bookID = clippingsResponse.data.clipping.bookID
  const rq = getReactQueryClient()
  if (bookID && bookID.length > 3) {
    const bs = await rq.fetchQuery({
      queryKey: ['wenqu', 'books', 'dbId', bookID],
      queryFn: () =>
        wenquRequest<WenquSearchResponse>(`/books/search?dbId=${bookID}`),
      staleTime: duration3Days,
      gcTime: duration3Days,
    })
    bookData = bs.books[0]
  }

  const clipping = clippingsResponse.data.clipping
  const creator = clipping.creator
  const me = myProfile
  const isPremium = me?.premiumEndAt
    ? new Date(me.premiumEndAt).getTime() > new Date().getTime()
    : false
  // const clippingAt = useLocalTime(clipping?.clipping.createdAt)
  const clippingAt = clipping?.createdAt
  const { t } = await useTranslation()

  return (
    <>
      <div className={`${styles.clipping} page anna-fade-in`}>
        <div className="with-slide-in mt-4 flex flex-col gap-4 lg:mt-24 lg:flex-row">
          <div
            className={
              'bg-opacity-50 my-4 flex-3 rounded-xl p-4 text-black shadow-sm lg:p-10 dark:bg-slate-800 dark:text-slate-200'
            }
            data-glow
            style={
              {
                '--base': 80,
                '--spread': 500,
                '--outer': 1,
                backdropFilter: 'blur(calc(var(--cardblur, 5) * 1px))',
              } as React.CSSProperties
            }
          >
            <>
              <h1 className="font-lxgw my-2 text-xl font-bold lg:text-3xl">
                {bookData?.title ?? clipping.title}
                {/* <h6 className='text-gray-500 text-xs ml-4 inline-block dark:text-gray-300'>
                {clipping.clipping.title}
              </h6> */}
              </h1>
              <h3 className="font-lxgw my-4 font-light lg:text-lg">
                {bookData?.author}
              </h3>
              <hr className="my-12 bg-gray-400" />
              {/* <ClippingContent
              className='lg:text-4xl text-3xl lg:leading-loose leading-normal font-lxgw'
              content={clipping?.clipping.content ?? ''}
            /> */}
              <ClippingRichContent
                isPremium={isPremium}
                isGrandAdmin={isGrandAdmin({ id: me?.id })}
                className="font-lxgw text-3xl leading-normal lg:text-4xl lg:leading-loose"
                richContent={clipping.richContent}
                clippingId={clipping.id}
                bookId={clipping.bookID}
              />

              <hr className="my-12 bg-gray-400" />
              <Reactions
                reactions={clipping.reactionData}
                uid={uid ? ~~uid : undefined}
                cid={clipping.id || -1}
              />
              <hr className="my-12 bg-gray-400" />
              <footer className="mt-4 flex flex-col justify-between lg:flex-row">
                {me?.id === 0 && (
                  <Link
                    href={'/auth/auth-v4'}
                    className="flex w-full items-center justify-start"
                  >
                    <Image
                      src={
                        creator?.avatar.startsWith('http')
                          ? creator.avatar
                          : `${CDN_DEFAULT_DOMAIN}/${creator?.avatar}`
                      }
                      className="inline-block h-12 w-12 transform rounded-full object-cover shadow-2xl duration-300 hover:scale-110"
                      alt={creator.name}
                      width={48}
                      height={48}
                    />
                    <span className="ml-4 font-light text-gray-700 dark:text-gray-200">
                      {creator?.name}
                    </span>
                  </Link>
                )}
                <time className="flex w-full items-center justify-end text-sm font-light text-gray-700 lg:text-base">
                  {t('app.clipping.at')}: {clippingAt}
                </time>
              </footer>
            </>
          </div>
          {/** 再加一个作者简介 */}
          <ClippingSidebar
            clipping={clipping}
            book={bookData}
            me={me}
            inAppChannel={parseInt(iac) as IN_APP_CHANNEL}
          />
        </div>
        <CommentContainer me={me} clipping={clipping} book={bookData} />
      </div>
    </>
  )
}

export default Page
