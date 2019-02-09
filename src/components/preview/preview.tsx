import React from 'react'
import { Link } from '@reach/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { connect } from 'react-redux';
import Dialog from '../dialog/dialog'
const styles = require('./preview.css')

type TPreviewProps = {
  onCancel: () => void
  onOk: () => void
  content: string
  bookTitle: string
  author: string
  background: string
}

type TPreviewState = {
  output?: string
}

const CANVAS_CONFIG = {
  height: 1920,
  width: 1080
}

const QRCODE_METRIC = {
  width: 150,
  height: 150
}

function downloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve(img)
    }

    img.src = src
  })
}

class Preview extends React.PureComponent<TPreviewProps, TPreviewState> {
  state = {
    output: 'https://wx2.sinaimg.cn/mw1024/77ba321fly1ffhu39h0njj20zk0qo0yr.jpg'
  }

  async componentDidMount() {
    const canvas = document.createElement('canvas')
    canvas.width = CANVAS_CONFIG.width
    canvas.height = CANVAS_CONFIG.height
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      return
    }

    await this.renderBg(ctx)
    await this.renderText(ctx)
    await this.renderAuthor(ctx)
    await this.renderFooter(ctx)

    const output = canvas.toDataURL('image/png')
    this.setState({ output })
  }

  async renderBg(ctx: CanvasRenderingContext2D) {
    const bg = await downloadImage(require('../../assets/book-image.jpg') || this.props.background)
    ctx.save()
    ctx.filter = 'blur(10px)'
    ctx.drawImage(bg, -10, -10, CANVAS_CONFIG.width + 20, CANVAS_CONFIG.height + 20)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, CANVAS_CONFIG.width, CANVAS_CONFIG.height)
    ctx.restore()
  }

  async renderText(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.font = 'normal 64px -apple-system, BlinkMacSystemFont, Lato, "Microsoft Jhenghei", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
    ctx.fillStyle = '#fff'
    let text = this.props.content.slice()
    const step = 80
    let line = 0
    const lineOffset = 200

    const widthBoundry = CANVAS_CONFIG.width - 40 * 2
    let cursor = 0

    while(cursor < text.length) {
      const t = text.slice(0, cursor)
      const metric = ctx.measureText(t)

      if (metric.width > widthBoundry - 104) {
        ctx.fillText(t, 40, line * step + lineOffset)
        text = text.slice(cursor)
        line++
        cursor = 0
      }

      // ouput last row directly
      if (cursor === text.length - 1) {
        ctx.fillText(text, 40, line * step + lineOffset)
        break
      }
      // overflow check
      if (cursor > 1000) {
        break
      }
      cursor++
    }

    ctx.restore()
  }

  async renderAuthor(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.font = 'normal 48px -apple-system, BlinkMacSystemFont, Lato, "Microsoft Jhenghei", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
    ctx.fillStyle = '#fff'
    const titleMetric = ctx.measureText(this.props.bookTitle)
    ctx.fillText(this.props.bookTitle, CANVAS_CONFIG.width - 40 - titleMetric.width, CANVAS_CONFIG.height - 300)

    const author = '—— ' + this.props.author
    const authorMetric = ctx.measureText(author)
    ctx.fillText(author, CANVAS_CONFIG.width - 40 - authorMetric.width, CANVAS_CONFIG.height - 220)

    ctx.restore()
  }

  async renderFooter(ctx: CanvasRenderingContext2D) {
    ctx.save()
    const qrcode = await downloadImage(require('../../assets/website-qrcode.png'))
    ctx.drawImage(
      qrcode,
      CANVAS_CONFIG.width - 40 - QRCODE_METRIC.width,
      CANVAS_CONFIG.height - 170,
      QRCODE_METRIC.width,
      QRCODE_METRIC.height
    )
    ctx.restore()
  }

  render() {
    return (
      <Dialog
        onCancel={this.props.onCancel}
        onOk={this.props.onOk}
        title="图片预览"
      >
        <section className={styles.preview}>
          <img src={this.state.output} className={styles.previewImage} />
          <footer className={styles.footer}>
            <a
              href={this.state.output}
              download={`clippingkk-${this.props.bookTitle}-${this.props.author}.png`}
              className={styles.action + ' ' + styles.download}
            >
              保存
            </a>
          </footer>
        </section>
      </Dialog>
    )
  }
}

export default Preview
