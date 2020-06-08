import React from 'react'
import {
  getClipping,
  IClippingItem,
} from '../../services/clippings'
import { changeBackground } from '../../store/app/type'
import { connect } from 'react-redux'
import Card from '../../components/card/card'
import Preview from '../../components/preview/preview'
import { IBook, searchBookDetail } from '../../services/books';
import { updateClippingBook } from '../../store/clippings/type';
const styles = require('./clipping.css')

type TClippingPageProp = {
  userid: number
  clippingid: number
  changeBackground: (bg: string) => Promise<any>
  requestUpdateClippingBook: (clippingId: number) => Promise<any>
}

type TClippingPageState = {
  clipping: IClippingItem
  book: IBook
  dialogVisible: boolean
}

function mapActionToProps(dispatch: any) {
  return {
    changeBackground(bg: string) {
      return dispatch(changeBackground(bg))
    },

    requestUpdateClippingBook(clippingId: number) {
      return dispatch(updateClippingBook(clippingId))
    }
  }
}

// @ts-ignore
@connect(
  null,
  mapActionToProps
)
class ClippingPage extends React.PureComponent<
  TClippingPageProp,
  TClippingPageState
> {
  state = {
    clipping: {} as IClippingItem,
    book: {} as IBook,
    dialogVisible: true,
  }

  async componentDidMount() {
    const clipping = await getClipping(this.props.clippingid)
    const book = await searchBookDetail(clipping.bookId)

    this.setState({ book, clipping })
    this.props.changeBackground(book.image)
  }

  onCancel = () => {
    this.toggleDialog()
  }

  onOk = () => {
    this.toggleDialog()
  }

  toggleDialog = () => {
    this.setState({
      dialogVisible: !this.state.dialogVisible,
    })
  }

  updateClipping = () => {
    this.props.requestUpdateClippingBook(this.state.clipping.id)
  }

  render() {
    return (
      <div className={`${styles.clipping} page`}>
        <div className={styles.main}>
          <Card className={styles['main-card'] + ' text-black'}>
            <h1 className='text-2xl font-bold my-2'>{this.state.clipping.title}</h1>
            <h3 className='font-light text-lg my-4'>{this.state.book.author}</h3>
            <hr className={styles.hr} />
            <p className='text-3xl leading-normal'>{this.state.clipping.content}</p>
          </Card>
          {/** 再加一个作者简介 */}
          <Card className={styles.addons}>
            <ul className={styles['action-list']}>
              <li className={styles.action}>
                <button
                  className={styles['action-btn']}
                  onClick={this.updateClipping}
                >
                  书目更新
                </button>
              </li>

              <li className={styles.action}>
                <button
                  className={styles['action-btn']}
                  onClick={this.toggleDialog}
                >
                  图片分享
                </button>
              </li>
              <li className={styles.action}>
                <a
                  href={`https://book.douban.com/subject/${this.state.book.doubanId}`}
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

        {this.state.dialogVisible && this.state.clipping.content && (
          <Preview
            id={this.state.clipping.id}
            onCancel={this.onCancel}
            onOk={this.onOk}
            background={this.state.book.image}
            bookTitle={this.state.book.title}
            content={this.state.clipping.content}
            author={this.state.book.author}
          />
        )}
      </div>
    )
  }
}

export default ClippingPage
