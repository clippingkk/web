import React, { useState, useEffect, useCallback, useDebugValue } from 'react'
import { IBook, searchBookDetail, getBookClippings } from '../../services/books';
import { IClippingItem } from '../../services/clippings';
import BookInfo from '../../components/book-info/book-info';
import ClippingItem from '../../components/clipping-item/clipping-item';
import ListFooter from '../../components/list-footer/list-footer';
import Divider from '../../components/divider/divider';
import { changeBackground } from '../../store/app/type';
import { connect, useDispatch } from 'react-redux';
import { usePageTrack } from '../../hooks/tracke';
import { useSingleBook } from '../../hooks/book'
import { useQuery } from '@apollo/client';
import bookQuery from '../../schema/book.graphql'
import { book, bookVariables, book_book_clippings } from '../../schema/__generated__/book';
const styles = require('./book.css')
type TBookPageProps = {
  userid: number,
  bookid: string,
  bookDoubanID: number,
}

type bookClippingsState = {
  clippings: IClippingItem[],
  loadMore: () => Promise<any>,
  hasMore: boolean,
}

function BookPage({ userid, bookid }: TBookPageProps) {
  usePageTrack('book', {
    bookId: bookid
  })
  const dispatch = useDispatch()
  const bookData = useSingleBook(bookid)

  const [offset, setOffset] = useState(10)
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
  useDebugValue(clippingsData)

  if (!bookData) {
    return null
  }


  return (
    <section className={`${styles.bookPage} page`}>
      <BookInfo book={bookData} />
      <Divider title='书摘' />
      <div className={styles.clippings}>
        {clippingsData?.book.clippings.map(clipping => (
          <ClippingItem
            item={clipping}
            userid={userid}
            key={clipping.id}
          />
        ))}
        <ListFooter
          loadMoreFn={() => {
            if (loading) {
              return
            }
            if (offset === -1) {
              return
            }
            fetchMore({
              variables: {
                id: ~~bookid,
                pagination: {
                  limit: 10,
                  offset
                }
              },
              updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) {
                  return prev
                }
                if (fetchMoreResult.book.clippings.length === 0) {
                  setOffset(-1)
                }
                return {
                  ...prev,
                  book: {
                    ...prev.book,
                    clippings: [...prev.book.clippings, ...fetchMoreResult.book.clippings]
                  }
                }
              }
            }).then(() => {
              setOffset(o => o === -1 ? o : (o + 10))
            })
          }}
          hasMore={offset >= 0}
        />
      </div>
    </section>
  )
}

export default BookPage
