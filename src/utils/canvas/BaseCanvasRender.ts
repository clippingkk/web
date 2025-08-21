/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { PostShareConfig } from './mp-render'

export class BaseCanvasRender {
  // @ts-expect-error
  protected dom: HTMLCanvasElement
  // @ts-expect-error
  protected ctx: CanvasRenderingContext2D
  // @ts-expect-error
  protected config: PostShareConfig
  protected readonly defaultFontFamily =
    'MaShanZheng,YSHaoShenTi,-apple-system-font,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Hiragino Sans GB,Microsoft YaHei UI,Microsoft YaHei,Arial,sans-serif'

  // static readonly STOP_WORDS = [',', '.', ' ', '，', '。', '!', '！']
  static readonly STOP_WORDS = ['']

  protected guessMaxHeight() {
    return 0
  }

  get scaledWidth(): number {
    return this.config.width
  }
  get scaledHeight(): number {
    return this.config.height
  }
  get scaledPadding(): number {
    return this.config.padding
  }

  get renderFont(): string {
    return (
      this.config.textFont.join(',') +
      (this.config.textFont.length > 0 ? ',' : '') +
      this.defaultFontFamily
    )
  }

  private setupContentFontStyle() {
    this.ctx.font = `${this.config.baseTextSize}px ${this.renderFont}`
    this.ctx.textAlign = 'left'
    this.ctx.textBaseline = 'middle'
  }

  private drawOneLineText(text: string, x: number, y: number) {
    const content = text.trim()
    this.ctx.save()
    this.setupContentFontStyle()
    this.ctx.fillText(content, x, y)
    this.ctx.restore()
  }

  protected drawText(
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const context = this.ctx
    const words = BaseCanvasRender.STOP_WORDS.reduce<string[]>((acc, cur) => {
      if (acc.length === 0) {
        return text.split(cur)
      }

      const temp: string[] = []
      acc.forEach((x) => {
        temp.push(...x.split(cur))
      })
      return temp
    }, [])
    let line = ''

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n]
      this.setupContentFontStyle()
      const metrics = context.measureText(testLine)
      const testWidth = metrics.width
      if (testWidth > maxWidth && n > 0) {
        this.drawOneLineText(line, x, y)
        line = words[n]
        y += lineHeight
      } else {
        line = testLine
      }
    }
    this.drawOneLineText(line, x, y)

    return y
  }
}
