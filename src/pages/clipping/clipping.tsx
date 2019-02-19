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
const styles = require('./clipping.css')

type TClippingPageProp = {
  userid: number
  clippingid: number
  changeBackground: (bg: string) => Promise<any>
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
    // this.props.changeBackground(book.image)
    // this.props.changeBackground('https://cdn.annatarhe.com/athena/jike/FgGx0e6uGeaid26uWDydQ5FJ6Otd.jpg-copyrightDB.webp')
    this.props.changeBackground(
      'http://wx3.sinaimg.cn/large/8112eefdgy1ffsagko3p8j21kw23q4qp.jpg'
    )
  }

  onCancel = () => {
    console.log('cancel')
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

  render() {
    return (
      <div className={`${styles.clipping} page`}>
        <div className={styles.main}>
          <Card className={styles.mainCard}>
            <h1 className={styles.title}>{this.state.clipping.title}</h1>
            <h3 className={styles.author}>{this.state.book.author}</h3>
            <hr className={styles.hr} />
            <p className={styles.content}>{this.state.clipping.content}</p>
          </Card>
          {/** 再加一个作者简介 */}
          <Card className={styles.addons}>
            <ul className={styles.actionList}>
              <li className={styles.action}>
                <button
                  className={styles.actionBtn}
                  onClick={this.toggleDialog}
                >
                  图片分享
                </button>
              </li>
              <li className={styles.action}>
                <a
                  href={`https://book.douban.com/subject/${
                    this.state.book.doubanId
                  }`}
                  target="_blank"
                  className={styles.actionBtn}
                >
                  豆瓣读书
                </a>
              </li>
              <li className={styles.action}>
                <p className={styles.actionBtn}>评论 (开发中)</p>
              </li>
            </ul>
          </Card>
        </div>

        {this.state.dialogVisible && this.state.clipping.content && (
          <Preview
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
