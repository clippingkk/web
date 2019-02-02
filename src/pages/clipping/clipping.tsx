import React from 'react'
import { searchBookDetail, getClipping, IClippingItem, TBook } from '../../services/clippings';
import { changeBackground } from '../../store/app/type';
import { connect } from 'react-redux'
import Card from '../../components/card/card'
import Dialog from '../../components/dialog/dialog'
const styles = require('./clipping.css')

type TClippingPageProp = {
  userid: number
  clippingid: number,
  changeBackground: (bg: string) => Promise<any>
}

type TClippingPageState = {
  clipping: IClippingItem,
  book: TBook,
  dialogVisible: boolean
}

function mapActionToProps(dispatch: any) {
  return {
    changeBackground(bg: string) {
      return dispatch(changeBackground(bg))
    }
  }
}

// @ts-ignore
@connect(null, mapActionToProps)
class ClippingPage extends React.PureComponent<TClippingPageProp, TClippingPageState> {

  state = {
    clipping: {} as IClippingItem,
    book: {} as TBook,
    dialogVisible: true,
  }

  async componentDidMount() {
    const clipping = await getClipping(this.props.clippingid)
    const book = await searchBookDetail(clipping.title)

    this.setState({ book, clipping })
    // this.props.changeBackground(book.image)
    this.props.changeBackground('https://cdn.annatarhe.com/athena/jike/FgGx0e6uGeaid26uWDydQ5FJ6Otd.jpg-copyrightDB.webp')
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
      dialogVisible: !this.state.dialogVisible
    })
  }

  render() {
    return (
      <div className={styles.clipping}>

        <div className={styles.main}>
          <Card className={styles.mainCard}>
            <h1 className={styles.title}>{this.state.clipping.title}</h1>
            <h3 className={styles.author}>{this.state.book.author}</h3>
            <hr className={styles.hr} />
            <p className={styles.content}>{this.state.clipping.content}</p>
          </Card>
          <Card className={styles.addons}>
            <ul className={styles.actionList}>
              <li className={styles.action}>
                <button className={styles.actionBtn} onClick={this.toggleDialog}>图片分享</button>
              </li>
              <li className={styles.action}>
                <a href={this.state.book.url} target="_blank" className={styles.actionBtn}>豆瓣读书</a>
              </li>
              <li className={styles.action}>
                <p className={styles.actionBtn}>评论 (开发中)</p>
              </li>
            </ul>
          </Card>
        </div>

        {this.state.dialogVisible && (
          <Dialog
            onCancel={this.onCancel}
            onOk={this.onOk}
            title="图片预览"
          >
            <div> lalalla</div>
          </Dialog>
        )}
      </div>
    )
  }
}

export default ClippingPage
