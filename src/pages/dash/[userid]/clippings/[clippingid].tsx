import React, { useState, useCallback } from 'react'
// import { changeBackground } from '../../../../store/app/type'
import { useDispatch, useSelector } from 'react-redux'
import Card from '../../../../components/card/card'
import Preview from '../../../../components/preview/preview3'
import fetchClippingQuery from '../../../../schema/clipping.graphql'
import { useQuery } from '@apollo/client'
import { fetchClipping, fetchClippingVariables } from '../../../../schema/__generated__/fetchClipping'
import { useSingleBook } from '../../../../hooks/book'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { TGlobalStore } from '../../../../store'
import { UserContent } from '../../../../store/user/type'
import CommentBox from './commentBox'
import Comment from './comment'
import { useLocalTime } from '../../../../hooks/time'
import Reactions from './reactions'
import ClippingContent from '../../../../components/clipping-content'
import ClippingSidebar from './clipping-sidebar'
import { IN_APP_CHANNEL } from '../../../../services/channel'
import { CDN_DEFAULT_DOMAIN } from '../../../../constants/config'
import OGWithClipping from '../../../../components/og/og-with-clipping'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { client } from '../../../../services/ajax'
import DashboardContainer from '../../../../components/dashboard-container/container'

import styles from './clipping.module.css'
import { WenquBook, wenquRequest, WenquSearchResponse } from '../../../../services/wenqu'
import Head from 'next/head'
import Image from 'next/image'
function ClippingPage(serverResponse: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { clippingid } = useRouter().query as { clippingid: string }

  const { data: clippingLocalData } = useQuery<fetchClipping, fetchClippingVariables>(fetchClippingQuery, {
    variables: {
      id: ~~clippingid
    },
    // skip: !!serverResponse.clippingServerData
  })

  const clipping = clippingLocalData || serverResponse.clippingServerData

  const me = useSelector<TGlobalStore, UserContent>(s => s.user.profile)
  const [sharePreviewVisible, setSharePreviewVisible] = useState(false)
  const iac = (useRouter().query.iac ?? '0') as string

  const togglePreviewVisible = useCallback(() => {
    setSharePreviewVisible(v => !v)
  }, [])

  const localBook = useSingleBook(clipping?.clipping.bookID, !!serverResponse.bookServerData)
  // useEffect(() => {
  //   if (!book) {
  //     return
  //   }
  //   dispatch(changeBackground(book.image))
  // }, [book])

  const book = serverResponse.bookServerData || localBook
  const { t } = useTranslation()

  const clippingAt = useLocalTime(clipping?.clipping.createdAt)

  const creator = clipping?.clipping.creator
  return (
    <div className={`${styles.clipping} page anna-fade-in`}>
      <Head>
        <title>{book?.title ?? clipping.clipping.title}</title>
        <OGWithClipping clipping={clipping?.clipping} book={book} />
      </Head>
      <div className='flex mt-4 lg:mt-40 py-0 px-2 lg:px-20 with-slide-in'>
        <Card className={styles['main-card'] + ' text-black p-2 lg:p-10'}>
          <>
            <h1 className='lg:text-3xl text-xl font-bold my-2'>{clipping?.clipping.title}</h1>
            <h3 className='font-light lg:text-lg my-4'>{book?.author}</h3>
            <hr className='bg-gray-400 my-12' />
            <ClippingContent
              className='lg:text-4xl text-3xl lg:leading-loose leading-normal font-lxgw'
              content={clipping?.clipping.content ?? ''}
            />
            <hr className='bg-gray-400 my-12' />
            <Reactions reactions={clipping?.clipping.reactionData} cid={clipping?.clipping.id || -1} />
            <hr className='bg-gray-400 my-12' />
            <footer className='flex justify-between flex-col lg:flex-row mt-4'>
              {me.id === 0 && (
                <Link href={`/auth/auth-v2`}>
                  <a className='flex justify-start items-center w-full' >
                    <img
                      src={creator?.avatar.startsWith('http') ? creator.avatar : `${CDN_DEFAULT_DOMAIN}/${creator?.avatar}`}
                      className='w-12 h-12 rounded-full transform hover:scale-110 duration-300 shadow-2xl object-cover inline-block'
                      alt={creator.name}
                    />
                    <span className='ml-4 text-gray-700 dark:text-gray-200 font-light'>{creator?.name}</span>
                  </a>
                </Link>
              )}
              <time className='lg:text-base text-sm font-light w-full text-gray-700 flex items-center justify-end'>
                {t('app.clipping.at')}: {clippingAt}
              </time>
            </footer>
          </>
        </Card>
        {/** 再加一个作者简介 */}
        {me.id !== 0 && (
          <ClippingSidebar
            clipping={clipping?.clipping}
            book={book}
            onTogglePreviewVisible={togglePreviewVisible}
            me={me}
            inAppChannel={parseInt(iac) as IN_APP_CHANNEL}
          />
        )}
      </div>

      {
        me.id !== 0 && (
          <div className='container px-2 lg:px-20'>
            <Card>
              <>
                <h3 className='text-2xl lg:text-4xl font-light lg:mb-4'>{t('app.clipping.comments.title')}</h3>
                {clipping?.clipping.comments.map(m => (
                  <Comment key={m.id} comment={m} />
                ))}

                {clipping && me && (
                  <CommentBox me={me} clippingID={clipping?.clipping.id} />
                )}
              </>
            </Card>
          </div>
        )
      }

      {sharePreviewVisible &&
        clipping?.clipping.content &&
        book && (
          <Preview
            onCancel={togglePreviewVisible}
            onOk={togglePreviewVisible}
            background={book.image}
            clipping={clipping.clipping}
            book={book}
          />
        )}
    </div>
  )
}

type serverSideProps = {
  clippingServerData: fetchClipping
  bookServerData: WenquBook | null
}

export const getServerSideProps: GetServerSideProps<serverSideProps> = async (context) => {
  const cid = ~~(context.params?.clippingid ?? -1) as number
  // const uid = ~~(context.params?.userid ?? -1) as number
  const clippingsResponse = await client.query<fetchClipping, fetchClippingVariables>({
    query: fetchClippingQuery,
    fetchPolicy: 'network-only',
    variables: {
      id: ~~cid
    },
  })

  const bookID = clippingsResponse.data.clipping.bookID

  let book: WenquBook | null
  if (bookID.length <= 3) {
    book = null
  } else {
    // const me = useSelector<TGlobalStore, UserContent>(s => s.user.profile)
    book = await wenquRequest<WenquSearchResponse>(`/books/search?dbId=${bookID}`).then(bs => {
      if (bs.count !== 1) {
        return null
      }
      return bs.books[0]
    })
  }
  return {
    props: {
      clippingServerData: clippingsResponse.data,
      bookServerData: book
    },
  }
}

ClippingPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <DashboardContainer>
      {page}
    </DashboardContainer>
  )
}

export default ClippingPage
