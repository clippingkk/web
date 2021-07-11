import React, { useState, useCallback, useEffect } from 'react'
import { changeBackground } from '../../store/app/type'
import { useDispatch, useSelector } from 'react-redux'
import Card from '../../components/card/card'
import Preview from '../../components/preview/preview3'
import { updateClippingBook } from '../../store/clippings/type'
import fetchClippingQuery from '../../schema/clipping.graphql'
import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import { fetchClipping, fetchClippingVariables } from '../../schema/__generated__/fetchClipping'
import Switch from 'react-input-switch'
import { useSingleBook } from '../../hooks/book'
import { useTitle } from '../../hooks/tracke'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useParams } from '@reach/router'
import { TGlobalStore } from '../../store'
import { UserContent } from '../../store/user/type'
import CommentBox from './commentBox'
import Comment from './comment'
import { useLocalTime } from '../../hooks/time'
import Reactions from './reactions'
import ClippingContent from '../../components/clipping-content'
import ClippingSidebar from './clipping-sidebar'
import { IN_APP_CHANNEL } from '../../services/channel'
const styles = require('./clipping.css').default

type TClippingPageProp = {
  userid: number
  clippingid: string
}

function ClippingPage(props: TClippingPageProp) {
  const { data: clipping } = useQuery<fetchClipping, fetchClippingVariables>(fetchClippingQuery, {
    variables: {
      id: ~~props.clippingid
    }
  })
  const me = useSelector<TGlobalStore, UserContent>(s => s.user.profile)
  const [sharePreviewVisible, setSharePreviewVisible] = useState(false)
  const dispatch = useDispatch()
  const l = useLocation()

  const togglePreviewVisible = useCallback(() => {
    setSharePreviewVisible(v => !v)
  }, [])

  const book = useSingleBook(clipping?.clipping.bookID)
  useEffect(() => {
    if (!book) {
      return
    }
    dispatch(changeBackground(book.image))
  }, [book])

  useTitle(book?.title)
  const { t } = useTranslation()

  const clippingAt = useLocalTime(clipping?.clipping.createdAt)

  const creator = clipping?.clipping.creator

  console.log(l)
  return (
    <div className={`${styles.clipping} page anna-fade-in`}>
      <div className='flex mt-4 lg:mt-40 py-0 px-2 lg:px-20'>
        <Card className={styles['main-card'] + ' text-black p-2 lg:p-10'}>
          <h1 className='lg:text-3xl text-xl font-bold my-2'>{clipping?.clipping.title}</h1>
          <h3 className='font-light lg:text-lg my-4'>{book?.author}</h3>
          <hr className='bg-gray-400 my-12' />
          <ClippingContent className='lg:text-3xl text-2xl lg:leading-loose leading-normal font-lxgw' content={clipping?.clipping.content ?? ''} />
          <hr className='bg-gray-400 my-12' />
          <Reactions reactions={clipping?.clipping.reactions ?? []} cid={clipping?.clipping.id || -1} />
          <hr className='bg-gray-400 my-12' />
          <footer className='flex justify-between mt-4'>
            {me.id === 0 && (
              <Link className='flex justify-center items-center' to={`/auth/signin`}>
                <img
                  src={creator?.avatar.startsWith('http') ? creator.avatar : `https://clippingkk-cdn.annatarhe.com/${creator?.avatar}-copyrightDB`}
                  className='w-12 h-12 rounded-full transform hover:scale-110 duration-300 shadow-2xl object-cover'
                />
                <span className='ml-4 text-gray-700 dark:text-gray-200 font-light'>{creator?.name}</span>
              </Link>
            )}
            <time className='lg:text-base text-sm font-light w-full text-gray-700 flex items-center justify-end'>
              {t('app.clipping.at')}: {clippingAt}
            </time>
          </footer>
        </Card>
        {/** 再加一个作者简介 */}
        {me.id !== 0 && (
          <ClippingSidebar
            clipping={clipping?.clipping}
            book={book}
            onTogglePreviewVisible={togglePreviewVisible}
            me={me}
            inAppChannel={parseInt(new URLSearchParams(l.search).get('iac') ?? '0') as IN_APP_CHANNEL}
          />
        )}
      </div>

      {
        me.id !== 0 && (
          <div className='container px-2 lg:px-20'>
            <Card>
              <h3 className='text-2xl lg:text-4xl font-light lg:mb-4'>{t('app.clipping.comments.title')}</h3>
              {clipping?.clipping.comments.map(m => (
                <Comment key={m.id} comment={m} />
              ))}

              {clipping && me && (
                <CommentBox me={me} clippingID={clipping?.clipping.id} />
              )}
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

export default ClippingPage
