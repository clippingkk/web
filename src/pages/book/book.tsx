import React, { useState, useEffect, useDebugValue } from 'react'
import BookInfo from '../../components/book-info/book-info';
import ClippingItem from '../../components/clipping-item/clipping-item';
import ListFooter from '../../components/list-footer/list-footer';
import Divider from '../../components/divider/divider';
import { changeBackground } from '../../store/app/type';
import { useDispatch } from 'react-redux';
import { usePageTrack } from '../../hooks/tracke';
import { useSingleBook } from '../../hooks/book'
import { useQuery } from '@apollo/client';
import bookQuery from '../../schema/book.graphql'
import { book, bookVariables, book_book_clippings } from '../../schema/__generated__/book';
import { useTranslation } from 'react-i18next';
const styles = require('./book.css').default
type TBookPageProps = {
  userid: number,
  bookid: string,
  bookDoubanID: number,
}

function BookPage({ userid, bookid }: TBookPageProps) {
  usePageTrack('book', {
    bookId: bookid
  })
  const dispatch = useDispatch()
  const bookData = useSingleBook(bookid)

  const [hasMore, setHasMore] = useState(true)
  const { data: clippingsData, fetchMore, loading } = useQuery<book, bookVariables>(bookQuery, {
    variables: {
      id: ~~bookid,
      pagination: {
        limit: 10,
        offset: 0
      }
    },
  })

  useEffect(() => {
    if (!bookData) {
      return
    }
    dispatch(changeBackground(bookData.image))
  }, [bookData, changeBackground])

  useEffect(() => {
    if (!bookData) {
      return
    }

    const oldTitle = document.title
    document.title = `${bookData.title} - clippingkk`

    return () => {
      document.title = oldTitle
    }
  }, [bookData])
  const { t } = useTranslation()

  if (!bookData) {
    return null
  }

  return (
    <section className={`${styles.bookPage} page anna-fade-in`}>
      <BookInfo book={bookData} />
      <Divider title={t('app.book.title')} />
      <div className={styles.clippings}>
        {clippingsData?.book.clippings.map(clipping => (
          <ClippingItem
            item={clipping}
            userid={userid}
            book={bookData}
            key={clipping.id}
          />
        ))}
        <ListFooter
          loadMoreFn={() => {
            if (loading) {
              return
            }
            fetchMore({
              variables: {
                id: ~~bookid,
                pagination: {
                  limit: 10,
                  offset: clippingsData?.book.clippings.length
                }
              },
              updateQuery: (prev: book, { fetchMoreResult }) => {
                if (!fetchMoreResult) {
                  return prev
                }
                if (fetchMoreResult.book.clippings.length < 10) {
                  setHasMore(false)
                }
                return {
                  ...prev,
                  book: {
                    ...prev.book,
                    clippings: [...prev.book.clippings, ...fetchMoreResult.book.clippings]
                  }
                }
              }
            })
          }}
          hasMore={hasMore}
        />
      </div>
    </section>
  )
}

export default BookPage
