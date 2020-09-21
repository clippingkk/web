import React, { useState } from 'react'
import { getBooks, IBook, IHttpBook, covertHttpBook2Book } from '../../services/books';
import BooksContent from './books';
import ListFooter from '../../components/list-footer/list-footer';
import useSWR, { useSWRInfinite } from 'swr';
import homeListQuery from '../../schema/books.graphql'
import { useQuery } from '@apollo/client';
import { books, booksVariables } from '../../schema/__generated__/books';
const styles = require('./home.css')

type THomeProp = {
  userid: number
}

const STEP = 10
function HomePage(props: THomeProp) {
  const [offset, setOffset] = useState(0)
  const { data, fetchMore, loading } = useQuery<books, booksVariables>(homeListQuery, {
    variables: {
      pagination: {
        limit: STEP,
        offset: 0
      },
    }
  })

  if (!data) {
    return (
      <div>loading</div>
    )
  }
  return (
    <section className={`${styles.home} page`}>
      <header className='flex items-center justify-center my-4'>
        <h2 className='text-center font-light text-black text-3xl'>我的书籍</h2>
      </header>

      <div className={styles.clippings}>
        <BooksContent
          list={data.books}
          userid={props.userid}
        />
      </div>

      <ListFooter
        loadMoreFn={() => {
          if (loading) {
            return
          }
          fetchMore({
            variables: {
              pagination: {
                limit: 10,
                offset
              }
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult || fetchMoreResult.books.length === 0) {
                setOffset(-1)
                return prev
              }
              return {
                ...prev,
                books: [...prev.books, ...fetchMoreResult.books] as any
              }
            }
          }).then((res) => {
            setOffset(o => o === -1 ? o : (o + STEP))
          })

        }}
        hasMore={offset !== -1}
      />
    </section>
  )

}

export default HomePage
