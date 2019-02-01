import React from 'react'
import { getClippings, IClippingItem } from '../../services/clippings'
const styles = require('./home.css')


type homeState = {
  list: IClippingItem[]
  hasMore: boolean
  offset: number
  loading: boolean
}

class HomePage extends React.PureComponent<any, homeState> {

  state = {
    list: [],
    hasMore: true,
    offset: 0,
    loading: false,
  }

  componentDidMount() {
    this.loadMore()
  }

  async loadMore() {
    if (this.state.loading || !this.state.hasMore) {
      return
    }
    this.setState({ loading: true })
    try {
      const list = await getClippings(this.state.offset)
      if (list.length < 20) {
        this.setState({ hasMore: false })
      }
      this.setState({
        list: [...this.state.list, ...list],
        offset: this.state.offset + 20
      })
    } catch (e) {
      console.error(e)
    } finally {
      this.setState({ loading: false })
    }
  }

  render() {
    return (
      <section>
        auth
      </section>
    )
  }
}

export default HomePage
