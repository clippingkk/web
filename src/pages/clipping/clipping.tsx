import React, { useState, useCallback, useEffect } from 'react'
import {
  getClipping,
  IClippingItem,
} from '../../services/clippings'
import { changeBackground } from '../../store/app/type'
import { connect, useDispatch } from 'react-redux'
import Card from '../../components/card/card'
import Preview from '../../components/preview/preview'
import { IBook, searchBookDetail } from '../../services/books';
import { updateClippingBook } from '../../store/clippings/type';
import useSWR from 'swr'
const styles = require('./clipping.css')

type TClippingPageProp = {
  userid: number
  clippingid: number
}


function ClippingPage(props: TClippingPageProp) {
  const [sharePreviewVisible, setSharePreviewVisible] = useState(false)
  const dispatch = useDispatch()

  const togglePreviewVisible = useCallback(() => {
    setSharePreviewVisible(v => !v)
  }, [])
  const { data: clipping } = useSWR<IClippingItem>(
    `clippings:${props.clippingid}`,
    (k: string) => getClipping(~~k.split(':')[1])
  )
  const { data: book } = useSWR<IBook>(
    () => clipping ? `book:${clipping.bookId}` : null,
    (k: string) => searchBookDetail(k.split(':')[1])
  )
  const updateClipping = useCallback(() => {
    if (!clipping) {
      return
    }
    dispatch(updateClippingBook(clipping.id))
  }, [clipping])

  useEffect(() => {
    if (!book) {
      return
    }
    dispatch(changeBackground(book.image))
  }, [book])

  useEffect(() => {
    if (!book) {
      return
    }
    const t = document.title
    document.title = book.title + ' --clippingkk'
    return () => {
      document.title = t
    }
  }, [book])

  // const clipping = await getClipping(this.props.clippingid)
  // const book = await searchBookDetail(clipping.bookId)
  return (
    <div className={`${styles.clipping} page`}>
      <div className={styles.main}>
        <Card className={styles['main-card'] + ' text-black'}>
          <h1 className='text-2xl font-bold my-2'>{clipping?.title}</h1>
          <h3 className='font-light text-lg my-4'>{book?.author}</h3>
          <hr className={styles.hr} />
          <p className='text-3xl leading-normal'>{clipping?.content}</p>
        </Card>
        {/** 再加一个作者简介 */}
        <Card className={styles.addons}>
          <ul className={styles['action-list']}>
            <li className={styles.action}>
              <button
                className={styles['action-btn']}
                onClick={updateClipping}
              >
                书目更新
                </button>
            </li>

            <li className={styles.action}>
              <button
                className={styles['action-btn']}
                onClick={togglePreviewVisible}
              >
                图片分享
                </button>
            </li>
            <li className={styles.action}>
              <a
                href={`https://book.douban.com/subject/${book?.doubanId}`}
                target="_blank"
                className={styles['action-btn']}
              >
                豆瓣读书
                </a>
            </li>
            <li className={styles.action}>
              <p className={styles['action-btn']}>评论 (开发中)</p>
            </li>
          </ul>
        </Card>
      </div>

      {sharePreviewVisible && clipping?.content && (
        <Preview
          id={clipping.id}
          onCancel={togglePreviewVisible}
          onOk={togglePreviewVisible}
          background={book!.image}
          bookTitle={book!.title}
          content={clipping.content}
          author={book!.author}
        />
      )}
    </div>
  )
}

export default ClippingPage
