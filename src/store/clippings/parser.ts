import { log } from "../../utils/sentry";

export type TClippingItem = {
  title: string
  content: string
  pageAt: string
  bookId: string
  createdAt: string
}

enum KindleClippingFileLines {
  TitleLine = 0,
  InfoLine = 1,
  SpaceLine = 2,
  ContentLine = 3,
  LastLine = 4
}

enum FileLanuages {
  Chinese,
  English
}

class ClippingTextParser {
  private lines: string[][] = [];
  private position: number = 0;
  private processingItem: TClippingItem = {} as any
  private result: TClippingItem[] = []
  // private readonly infoRegexp: RegExp
  private readonly locationRegexp: RegExp
  static readonly STOP_WORDS = ['(', '（']
  static readonly symbols = ["，", "。", "！", "@", "——", "【", "】"]

  public readonly language: FileLanuages;

  constructor(file: string) {
    const lines = file.split('\n')
    let temp: string[] = []
    lines.forEach(line => {
      line = line.trim()
      if (line.includes("========")) {
        this.lines.push(temp)
        temp = []
      }
      if (line && !line.includes("========")) {
        temp.push(line)
      }
    })

    if (file.includes("Your Highlight on")) {
      this.locationRegexp = /\d+(-?\d+)?/g
      this.language = FileLanuages.English
    } else if (file.includes("您在")) {
      this.locationRegexp = /#\d+(-?\d+)?/g
      this.language = FileLanuages.Chinese
    } else {
      throw new Error('哎呀呀，暂不支持非中英文的内容呢~')
    }
  }

  public execute(): TClippingItem[] {
    do {
      this.exactTitlte()
      this.exactInfo()
      this.exactContent()
      this.exactLastLine()
      this.next()
    } while (this.current)

    return this.result.filter(item => item.content && item.content !== "")
  }
  private exactInfo() {
    const l = this.current[1].split('|')
    const locationSection = l[0]
    const dateSection = l[l.length - 1]
    const m = locationSection.match(this.locationRegexp)
    if (!m) {
      return
    }

    this.setPageAt(m[m.length - 1])
    this.setDate(dateSection)
  }
  private setPageAt(pageAtString: string) {
    let pageAt = pageAtString
    if (this.language === FileLanuages.Chinese) {
      pageAt = pageAt.replace('您在位置 ', '')
    }
    if (this.language === FileLanuages.English) {
      pageAt = pageAt.replace('Your Highlight on ', '')
    }

    // 如果是 location 类型的则前面加 #
    if (
      pageAt.includes('-') &&
      !pageAt.startsWith('#')
    ) {
      pageAt = '#' + pageAt.trim()
    }

    this.processingItem.pageAt = pageAt
  }

  private setDate(matched: string) {
    let dateStr = matched.replace('添加于 ', '')

    if (this.language === FileLanuages.Chinese) {
      dateStr = dateStr.replace(/年/, '/')
        .replace(/月/, '/')
        .replace(/日/, '/')
        .replace(/星期[\u4e00-\u9fa5]/, '')
      if (dateStr.includes('上午')) {
        dateStr = dateStr.replace(/上午/g, '') + ' AM'
      }
      if (dateStr.includes('下午')) {
        dateStr = dateStr.replace(/下午/g, '') + ' PM'
      }
    }

    const date = new Date(dateStr)
    date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000) // 设置时区
    this.processingItem.createdAt = date.toISOString()
  }

  private trimSymbols(s: string): string {
    return s.replace(/^(，|。|！|@|【】|——)+/, '')
      .replace(/(，|。|！|@|【】|——)+$/, '')
      .trim()
  }

  private exactContent() {
    const content = (this.current[2] || '').trim()
    this.processingItem.content = this.trimSymbols(content)
  }

  private exactTitlte() {
    let title: string = this.current[0]
    ClippingTextParser.STOP_WORDS.forEach(x => {
      title = title.split(x)[0]
    })

    this.processingItem.title = title.trim()
  }

  private exactLastLine() {
    this.processingItem.bookId = '0'
    this.result.push(this.processingItem)
    this.processingItem = {} as any
  }

  protected get current() {
    return this.lines[this.position]
  }

  protected next() {
    this.position++
  }
}

export default ClippingTextParser
