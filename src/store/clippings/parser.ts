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
  private readonly infoRegexp: RegExp;

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
      this.infoRegexp = /Your Highlight on (\w+ \d*-?\d*) | Added on (.*)/g
      this.language = FileLanuages.English
    } else if (file.includes("您在位置 ")) {
      this.infoRegexp = /您在位置\ (#\d+-?\d* ?的[\u4e00-\u9fa5]{2}) | 添加于 (.*)/g
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

    return this.result.filter(item => item.content !== "")
  }
  private exactInfo() {
    const matched = this.current[1].match(this.infoRegexp)
    if (!matched || matched.length < 2) {
      console.log('match location error', { text: this.current, matched }, this)
      this.processingItem.pageAt = ''
      this.processingItem.createdAt = new Date().toISOString()
      return
    }
    this.setPageAt(matched[0])
    this.setDate(matched[1])
  }
  private setPageAt(pageAtString: string) {
    let pageAt = pageAtString
    if (this.language === FileLanuages.Chinese) {
      pageAt = pageAt.replace('您在位置 ', '')
    }
    if (this.language === FileLanuages.English) {
      pageAt = pageAt.replace('Your Highlight on ', '')
    }
    this.processingItem.pageAt = pageAt.trim()
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

    this.processingItem.createdAt = new Date(dateStr).toISOString()
  }

  private exactContent() {
    this.processingItem.content = this.current[2]
  }

  private exactTitlte() {
    const title = this.current[0].split('(')[0]
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
