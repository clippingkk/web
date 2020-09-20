import React, { useState } from 'react'
import { getBooks, IBook, IHttpBook, covertHttpBook2Book } from '../../services/books';
import BooksContent from './books';
import ListFooter from '../../components/list-footer/list-footer';
import useSWR, { useSWRInfinite } from 'swr';
import homeListQuery from '../../schema/books.graphql'
import { useQuery } from '@apollo/client';
import { books, booksVariables } from '../../schema/__generated__/books';
const styles = require('./home.css')

type THomeState = {
  list: IBook[]
  hasMore: boolean
  offset: number
  loading: boolean
}

type THomeProp = {
  userid: number
}

const STEP = 10

function _HomePage(props: THomeProp) {
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
              console.log(prev, fetchMoreResult)
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

class HomePage extends React.PureComponent<THomeProp, THomeState> {
  state = {
    list: [],
    hasMore: true,
    offset: 0,
    loading: false,
  }

  maxRetryTimes = __DEV__ ? 1 : 15

  loadMore = async () => {
    if (this.state.loading || !this.state.hasMore) {
      return
    }

    if (this.maxRetryTimes <= 0) {
      return
    }

    this.setState({ loading: true })
    try {
      const list = await getBooks(this.props.userid, this.state.offset)
      if (list.length === 0) {
        this.setState({ hasMore: false })
      }
      this.setState({
        list: [...this.state.list, ...list],
        offset: this.state.offset + 20,
      })
    } catch (e) {
      this.maxRetryTimes--
      console.error(e)
    } finally {
      this.setState({ loading: false })
    }
  }

  render() {
    return (
      <section className={`${styles.home} page`}>
        <header className='flex items-center justify-center my-4'>
          <h2 className='text-center font-light text-black text-3xl'>我的书籍</h2>
        </header>

        <div className={styles.clippings}>
          <BooksContent
            list={this.state.list}
            userid={this.props.userid}
          />
        </div>

        <ListFooter
          loadMoreFn={this.loadMore}
          hasMore={this.state.hasMore}
        />
      </section>
    )
  }
}

export default _HomePage
