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

  return (
    <div className={`${styles.clipping} page`}>
      <div className={styles.main}>
        <Card className={styles['main-card'] + ' text-black'}>
          <h1 className='text-2xl font-bold my-2'>{clipping?.clipping.title}</h1>
          <h3 className='font-light text-lg my-4'>{book?.author}</h3>
          <hr className={styles.hr} />
          <p className='text-3xl leading-normal'>{clipping?.clipping.content}</p>
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
          id={clipping.clipping.id}
          onCancel={togglePreviewVisible}
          onOk={togglePreviewVisible}
          background={book!.image}
          bookTitle={book!.title}
          content={clipping.clipping.content}
          author={book!.author}
        />
      )}
    </div>
  )
}

export default ClippingPage
