import React, { useState, useCallback, useEffect } from 'react'
import { changeBackground } from '../../store/app/type'
import { useDispatch } from 'react-redux'
import Card from '../../components/card/card'
import Preview from '../../components/preview/preview'
import { updateClippingBook } from '../../store/clippings/type'
import fetchClippingQuery from '../../schema/clipping.graphql'
import { useQuery } from '@apollo/client'
import { fetchClipping, fetchClippingVariables } from '../../schema/__generated__/fetchClipping'
import { useSingleBook } from '../../hooks/book'
import { useTitle } from '../../hooks/tracke'
import { useTranslation } from 'react-i18next'
import { navigate } from '@reach/router'
const styles = require('./clipping.css')

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

  const clippingAtDate = clipping?.clipping ? new Date(clipping.clipping.createdAt) : new Date()
  const clippingAt = new Intl.
  DateTimeFormat(
    navigator.language,
    {
      hour: 'numeric', minute: 'numeric',
      year: 'numeric', month: 'numeric', day: 'numeric',
    }
    ).
  format(clippingAtDate)

  const clippingContent = clipping?.clipping.content.replace(/\[\d*\]/, '')

  return (
    <div className={`${styles.clipping} page`}>
      <div className='flex mt-40 py-0 px-2 lg:px-20'>
        <Card className={styles['main-card'] + ' text-black p-2 lg:p-10'}>
          <h1 className='text-3xl font-bold my-2'>{clipping?.clipping.title}</h1>
          <h3 className='font-light text-lg my-4'>{book?.author}</h3>
          <hr className='bg-gray-400 my-12' />
          <p className='text-4xl leading-normal'>{clippingContent}</p>
          <hr className='bg-gray-400 my-12' />
          <time className='text-base font-light text-right w-full block mt-4 text-gray-700'>
            {t('app.clipping.at')}: {clippingAt}
            </time>
        </Card>
        {/** 再加一个作者简介 */}
        <Card className={styles.addons}>
          <ul className={styles['action-list']}>
            <li className={styles.action}>
              <button
                className={styles['action-btn']}
                onClick={updateClipping}
              >
                {t('app.clipping.update')}
              </button>
            </li>

            <li className={styles.action}>
              <button
                className={styles['action-btn']}
                onClick={togglePreviewVisible}
              >
                {t('app.clipping.shares')}
              </button>
            </li>
            <li className={styles.action}>
              <a
                href={`https://book.douban.com/subject/${book?.doubanId}`}
                target="_blank"
                className={styles['action-btn']}
              >
                {t('app.clipping.link')}
              </a>
            </li>
            <li className={styles.action}>
              <p className={styles['action-btn']}>评论 (开发中)</p>
            </li>
          </ul>
        </Card>
      </div>

      {sharePreviewVisible && clipping?.clipping.content && (
        <Preview
          onCancel={togglePreviewVisible}
          onOk={togglePreviewVisible}
          background={book!.image}
          clipping={clipping.clipping}
          book={book}
        />
      )}
    </div>
  )
}

export default ClippingPage
