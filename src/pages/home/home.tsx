import React from 'react'
import { getClippings, IClippingItem } from '../../services/clippings'
import Card from '../../components/card/card'
import { Link } from '@reach/router'
import HomeContent from './content';
import { getBooks, IBook, IHttpBook, covertHttpBook2Book } from '../../services/books';
import BooksContent from './books';
import ListFooter from '../../components/list-footer/list-footer';
import useSWR, { useSWRInfinite } from 'swr';
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

function _HomePage(props: THomeProp) {
  const { data, size, setSize } = useSWRInfinite<IHttpBook[]>(index => `/clippings/books/${props.userid}?take=5&from=${index * 5}`)

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
          list={([] as IHttpBook[]).concat(...data).map(x => covertHttpBook2Book(x))}
          userid={props.userid}
        />
      </div>

      <ListFooter
        loadMoreFn={() => { setSize(size + 1) }}
        hasMore={data[data.length - 1].length >= 5}
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
