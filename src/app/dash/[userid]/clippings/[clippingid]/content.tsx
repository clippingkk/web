'use client';
import React, { useState, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Card from '@/components/card/card'
import Preview from '@/components/preview/preview4'
import { useSingleBook } from '@/hooks/book'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { TGlobalStore } from '@/store'
import { UserContent } from '@/store/user/type'
import CommentBox from './commentBox'
import Comment from './comment'
import { useLocalTime } from '@/hooks/time'
import Reactions from './reactions'
import ClippingContent from '@/components/clipping-content'
import ClippingSidebar from './clipping-sidebar'
import { IN_APP_CHANNEL } from '@/services/channel'
import { CDN_DEFAULT_DOMAIN } from '@/constants/config'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useSetAtom } from 'jotai'
import { appBackgroundAtom } from '@/store/global'
import { FetchClippingQuery, useFetchClippingQuery } from '@/schema/generated'
import styles from './clipping.module.css'
import { toast } from 'react-hot-toast';

type ClippingPageProps = {
  cid: number
  clipping: FetchClippingQuery
  iac: string
}

function ClippingPageContent(props: ClippingPageProps) {
  const { cid, clipping: clippingServerData, iac } = props

  const clipping = clippingServerData

  const me = useSelector<TGlobalStore, UserContent>(s => s.user.profile)
  const [sharePreviewVisible, setSharePreviewVisible] = useState(false)

  const book = useSingleBook(clipping.clipping.bookID)
  const { t } = useTranslation()

  const togglePreviewVisible = useCallback(() => {
    if (!book) {
      toast.error(t('app.clipping.share.noBook'))
    }
    setSharePreviewVisible(v => !v)
  }, [book, t])

  const setBg = useSetAtom(appBackgroundAtom)
  useEffect(() => {
    if (!book) {
      return
    }
    setBg(book.image)
  }, [book, setBg])

  const clippingAt = useLocalTime(clipping?.clipping.createdAt)
  const creator = clipping?.clipping.creator

  const [commentListRef] = useAutoAnimate()

  return (
    <div className={`${styles.clipping} page anna-fade-in`}>
      <div className='flex mt-4 lg:mt-40 py-0 px-2 lg:px-20 flex-col lg:flex-row with-slide-in'>
        <Card className={styles['main-card'] + ' text-black p-2 lg:p-10'}>
          <>
            <h1 className='lg:text-3xl text-xl font-bold my-2 font-lxgw'>
              {book?.title ?? clipping?.clipping.title}
              <h6 className='text-gray-500 text-xs ml-4 inline-block dark:text-gray-300'>
                {clipping.clipping.title}
              </h6>
            </h1>
            <h3 className='font-light lg:text-lg my-4 font-lxgw'>{book?.author}</h3>
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
                (<Link href={`/auth/auth-v3`} className='flex justify-start items-center w-full'>
                  <img
                    src={creator?.avatar.startsWith('http') ? creator.avatar : `${CDN_DEFAULT_DOMAIN}/${creator?.avatar}`}
                    className='w-12 h-12 rounded-full transform hover:scale-110 duration-300 shadow-2xl object-cover inline-block'
                    alt={creator.name}
                  />
                  <span className='ml-4 text-gray-700 dark:text-gray-200 font-light'>{creator?.name}</span>
                </Link>)
              )}
              <time className='lg:text-base text-sm font-light w-full text-gray-700 flex items-center justify-end'>
                {t('app.clipping.at')}: {clippingAt}
              </time>
            </footer>
          </>
        </Card>
        {/** 再加一个作者简介 */}
        <ClippingSidebar
          clipping={clipping?.clipping}
          book={book}
          onTogglePreviewVisible={togglePreviewVisible}
          me={me}
          inAppChannel={parseInt(iac) as IN_APP_CHANNEL}
        />
      </div>

      {
        me.id !== 0 && (
          <div className='container px-2 lg:px-20'>
            <Card>
              <>
                <h3 className='text-2xl lg:text-4xl font-light lg:mb-4'>{t('app.clipping.comments.title')}</h3>
                <ul ref={commentListRef}>
                {clipping?.clipping.comments.map(m => (
                  <Comment key={m.id} comment={m} />
                ))}
                </ul>
                {clipping && me && (
                  <CommentBox me={me} book={book} clipping={clipping?.clipping} />
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
  );
}

export default ClippingPageContent
