import React from 'react'
import { getClippings, IClippingItem } from '../../services/clippings'
import Card from '../../components/card/card'
import { Link } from '@reach/router'
import HomeContent from './content';
const styles = require('./home.css')

type THomeState = {
  list: IClippingItem[]
  hasMore: boolean
  offset: number
  loading: boolean
}

type THomeProp = {
  userid: number
}

class HomePage extends React.PureComponent<THomeProp, THomeState> {
  // @ts-ignore
  private loadMoreDom: HTMLSpanElement
  // @ts-ignore
  private loadMoreObserver: IntersectionObserver

  state = {
    list: [],
    hasMore: true,
    offset: 0,
    loading: false,
  }

  componentDidMount() {
    this.loadMore()

    this.loadMoreObserver = new IntersectionObserver(() => {
      this.loadMore()
    })
    this.loadMoreObserver.observe(this.loadMoreDom)
  }

  componentWillUnmount() {
    this.loadMoreObserver.disconnect()
  }

  async loadMore() {
    if (this.state.loading || !this.state.hasMore) {
      return
    }
    this.setState({ loading: true })
    try {
      const list = await getClippings(this.props.userid, this.state.offset)
      if (list.length < 20) {
        this.setState({ hasMore: false })
      }
      this.setState({
        list: [...this.state.list, ...list],
        offset: this.state.offset + 20,
      })
    } catch (e) {
      console.error(e)
    } finally {
      this.setState({ loading: false })
    }
  }

  render() {
    return (
      <section className={`${styles.home} page`}>
        <header className={styles.header}>
          <h2 className={styles.title}>我的书籍</h2>
        </header>

        <div className={styles.clippings}>
          <HomeContent
            list={this.state.list}
            userid={this.props.userid}
          />
        </div>

        <footer className={styles.footer}>
          <span
            className={styles.tip}
            ref={loadMoreDom =>
              (this.loadMoreDom = loadMoreDom as HTMLSpanElement)
            }
          >
            {this.state.hasMore ? 'loading' : '没有更多了...'}
          </span>
        </footer>
      </section>
    )
  }
}

export default HomePage
