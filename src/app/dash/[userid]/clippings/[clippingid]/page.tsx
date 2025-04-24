import React from 'react'
import { duration3Days } from '@/hooks/book'
import { FetchClippingQuery, FetchClippingQueryVariables, FetchClippingDocument, ProfileDocument, ProfileQuery, ProfileQueryVariables } from '@/schema/generated'
import { getReactQueryClient } from '@/services/ajax'
import { WenquBook, wenquRequest, WenquSearchResponse } from '@/services/wenqu'
import { generateMetadata as clippingGenerateMetadata } from '@/components/og/og-with-clipping'
import { Metadata } from 'next'
import { getApolloServerClient } from '@/services/apollo.server'
import { cookies } from 'next/headers'
import styles from './clipping.module.css'
import Link from 'next/link'
import { useTranslation } from '@/i18n'
import CommentContainer from './comment-container'
import Reactions from './reactions'
import ClippingRichContent from '@/components/text-content/clipping-rich-content'
import { isGrandAdmin } from '@/services/admin'
import ClippingSidebar from './clipping-sidebar'
import { IN_APP_CHANNEL } from '@/services/channel'
import Image from 'next/image'
import { CDN_DEFAULT_DOMAIN } from '@/constants/config'

type PageProps = {
  params: Promise<{ clippingid: string, userid: string }>
  searchParams: Promise<{ iac: string }>
}
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { clippingid } = (await props.params)
  const cid = ~~clippingid

  const client = getApolloServerClient()
  const clippingsResponse = await client.query<FetchClippingQuery, FetchClippingQueryVariables>({
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
      queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbId=${bookID}`),
      staleTime: duration3Days,
      gcTime: duration3Days,
    })
    b = bs.books.length === 1 ? bs.books[0] : null
  }

  return clippingGenerateMetadata({
    clipping: clippingsResponse.data.clipping,
    book: b
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
  const clippingsResponse = await client.query<FetchClippingQuery, FetchClippingQueryVariables>({
    query: FetchClippingDocument,
    fetchPolicy: 'network-only',
    variables: {
      id: ~~cid,
    },
    context: {
      headers: token ? {
        headers: {
          'Authorization': 'Bearer ' + token
        },
      } : undefined
    }
  })

  let myProfile: ProfileQuery['me'] | undefined = undefined
  if (uid) {
    const p = await client.query<ProfileQuery, ProfileQueryVariables>({
      query: ProfileDocument,
      variables: {
        id: ~~uid,
      },
      context: {
        headers: token ? {
          'Authorization': 'Bearer ' + token
        } : undefined
      }
    })
    myProfile = p.data.me
  }

  let bookData: WenquBook | null = null
  const bookID = clippingsResponse.data.clipping.bookID
  const rq = getReactQueryClient()
  if (bookID && bookID.length > 3) {
    const bs = await rq.fetchQuery({
      queryKey: ['wenqu', 'books', 'dbId', bookID],
      queryFn: () => wenquRequest<WenquSearchResponse>(`/books/search?dbId=${bookID}`),
      staleTime: duration3Days,
      gcTime: duration3Days,
    })
    bookData = bs.books[0]
  }

  const clipping = clippingsResponse.data.clipping
  const creator = clipping.creator
  const me = myProfile
  const isPremium = me?.premiumEndAt ?new Date(me.premiumEndAt).getTime() > new Date().getTime(): false
  // const clippingAt = useLocalTime(clipping?.clipping.createdAt)
  const clippingAt = clipping?.createdAt
  const { t } = await useTranslation()

  return (
    <>
      <div className={`${styles.clipping} page anna-fade-in`}>
        <div className='flex mt-4 lg:mt-24 flex-col lg:flex-row with-slide-in gap-4'>
          <div
            className={'my-4 p-4 rounded-xl shadow-sm dark:bg-slate-800 bg-opacity-50 flex-3 text-black dark:text-slate-200 lg:p-10'}
            data-glow
            style={{
              '--base': 80,
              '--spread': 500,
              '--outer': 1,
              backdropFilter: 'blur(calc(var(--cardblur, 5) * 1px))'
            } as React.CSSProperties}
          >
            <>
              <h1 className='lg:text-3xl text-xl font-bold my-2 font-lxgw'>
                {bookData?.title ?? clipping.title}
                {/* <h6 className='text-gray-500 text-xs ml-4 inline-block dark:text-gray-300'>
                {clipping.clipping.title}
              </h6> */}
              </h1>
              <h3 className='font-light lg:text-lg my-4 font-lxgw'>{bookData?.author}</h3>
              <hr className='bg-gray-400 my-12' />
              {/* <ClippingContent
              className='lg:text-4xl text-3xl lg:leading-loose leading-normal font-lxgw'
              content={clipping?.clipping.content ?? ''}
            /> */}
              <ClippingRichContent
                isPremium={isPremium}
                isGrandAdmin={isGrandAdmin({ id: me?.id })}
                className='lg:text-4xl text-3xl lg:leading-loose leading-normal font-lxgw'
                richContent={clipping.richContent}
                clippingId={clipping.id}
                bookId={clipping.bookID}
              />

              <hr className='bg-gray-400 my-12' />
              <Reactions reactions={clipping.reactionData} uid={~~uid} cid={clipping.id || -1} />
              <hr className='bg-gray-400 my-12' />
              <footer className='flex justify-between flex-col lg:flex-row mt-4'>
                {me?.id === 0 && (
                  (<Link href={'/auth/auth-v4'} className='flex justify-start items-center w-full'>
                    <Image
                      src={creator?.avatar.startsWith('http') ? creator.avatar : `${CDN_DEFAULT_DOMAIN}/${creator?.avatar}`}
                      className='w-12 h-12 rounded-full transform hover:scale-110 duration-300 shadow-2xl object-cover inline-block'
                      alt={creator.name}
                      width={48}
                      height={48}
                    />
                    <span className='ml-4 text-gray-700 dark:text-gray-200 font-light'>{creator?.name}</span>
                  </Link>)
                )}
                <time className='lg:text-base text-sm font-light w-full text-gray-700 flex items-center justify-end'>
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
