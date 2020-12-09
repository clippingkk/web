import React, { useState, useCallback, useEffect } from 'react'
import { changeBackground } from '../../store/app/type'
import { useDispatch, useSelector } from 'react-redux'
import Card from '../../components/card/card'
import Preview from '../../components/preview/preview'
import { updateClippingBook } from '../../store/clippings/type'
import fetchClippingQuery from '../../schema/clipping.graphql'
import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import { fetchClipping, fetchClippingVariables } from '../../schema/__generated__/fetchClipping'
import Switch from 'react-input-switch'
import { useSingleBook } from '../../hooks/book'
import { useTitle } from '../../hooks/tracke'
import { useTranslation } from 'react-i18next'
import { navigate } from '@reach/router'
import { TGlobalStore } from '../../store'
import { UserContent } from '../../store/user/type'
import CommentBox from './commentBox'
import Comment from './comment'
import { toggleClippingVisible, toggleClippingVisibleVariables } from '../../schema/mutations/__generated__/toggleClippingVisible'
import toggleClippingVisibleMutation from '../../schema/mutations/toggle-clipping-visible.graphql'
import { useLocalTime } from '../../hooks/time'
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

  const togglePreviewVisible = useCallback(() => {
    setSharePreviewVisible(v => !v)
  }, [])

  const book = useSingleBook(clipping?.clipping.bookID)
  const updateClipping = useCallback(() => {
    if (!clipping) {
      return
    }
    dispatch(updateClippingBook(clipping.clipping.id))
  }, [clipping])

  useEffect(() => {
    if (!book) {
      return
    }
    dispatch(changeBackground(book.image))
  }, [book])

  useTitle(book?.title)
  const { t } = useTranslation()

  const client = useApolloClient()
  const [execToggleClipping] = useMutation<toggleClippingVisible, toggleClippingVisibleVariables>(toggleClippingVisibleMutation)

  const clippingAt = useLocalTime(clipping?.clipping.createdAt)

  const clippingContent = clipping?.clipping.content.replace(/\[\d*\]/, '')

  return (
    <div className={`${styles.clipping} page anna-fade-in`}>
      <div className='flex mt-4 lg:mt-40 py-0 px-2 lg:px-20'>
        <Card className={styles['main-card'] + ' text-black p-2 lg:p-10'}>
          <h1 className='lg:text-3xl text-xl font-bold my-2'>{clipping?.clipping.title}</h1>
          <h3 className='font-light lg:text-lg my-4'>{book?.author}</h3>
          <hr className='bg-gray-400 my-12' />
          <p className='lg:text-4xl text-2xl leading-normal'>{clippingContent}</p>
          <hr className='bg-gray-400 my-12' />
          <time className='lg:text-base text-sm font-light text-right w-full block mt-4 text-gray-700'>
            {t('app.clipping.at')}: {clippingAt}
          </time>
        </Card>
        {/** 再加一个作者简介 */}
        <Card className='flex-1 hidden lg:block'>
          <ul className={styles['action-list']}>
            <li className='w-full mb-4'>
              <button
                className={styles['action-btn']}
                onClick={updateClipping}
              >
                {t('app.clipping.update')}
              </button>
            </li>

            <li className='w-full mb-4'>
              <button
                className={styles['action-btn']}
                onClick={togglePreviewVisible}
              >
                {t('app.clipping.shares')}
              </button>
            </li>
            <li className='w-full mb-4'>
              <a
                href={`https://book.douban.com/subject/${book?.doubanId}`}
                target="_blank"
                className={styles['action-btn']}
              >
                {t('app.clipping.link')}
              </a>
            </li>
            {clipping?.clipping.creator.id === me.id && (
              <li className='w-full mb-4'>
                <div className={styles['action-btn'] + ' w-full flex items-center justify-between'}>
                  <label htmlFor="">{t('app.clipping.visible')}</label>
                  <Switch
                    value={clipping?.clipping.visible ? 1 : 0}
                    onChange={() => {
                      if (!clipping) {
                        return
                      }
                      execToggleClipping({
                        variables: {
                          ids: [clipping.clipping.id]
                        }
                      }).then(() => {
                        client.resetStore()
                      })
                    }}
                  />
                </div>
              </li>
            )}
          </ul>
        </Card>
      </div>

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
