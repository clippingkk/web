import fs from 'node:fs'
import path from 'node:path'
import ClippingTextParser from '../parser'

function readFile(p: string) {
  return fs.readFileSync(path.resolve(__dirname, p)).toString()
}

test('parser: 英文文件解析', () => {
  const file = readFile('../__fixtures__/clippings_en.txt')
  const parser = new ClippingTextParser(file)

  const result = parser.execute()

  expect(result).toMatchSnapshot()
})

test('parser: 中文文件解析', () => {
  const file = readFile('../__fixtures__/clippings_zh.txt')
  const parser = new ClippingTextParser(file)

  const result = parser.execute()
  expect(result).toMatchSnapshot()
})

test('parser: 其他资源解析', () => {
  const file = readFile('../__fixtures__/clippings_other.txt')
  const parser = new ClippingTextParser(file)

  const result = parser.execute()
  expect(result).toMatchSnapshot()
})

test('parser: t', () => {
  const f = `
Pride and Prejudice (免费公版书) (Austen, Jane)
- 您在第 14 页（位置 #305-308）的标注 | 添加于 2019年4月17日星期三 上午8:44:37

Happiness in marriage is entirely a matter of chance. If the dispositions of the parties are ever so well known to each other or ever so similar beforehand, it does not advance their felicity in the least. They always continue to grow sufficiently unlike afterwards to have their share of vexation; and it is better to know as little as possible of the defects of the person with whom you are to pass your life."
==========
`
  const p = new ClippingTextParser(f)
  expect(p.execute()).toMatchInlineSnapshot(`
    [
      {
        "bookId": "0",
        "content": "Happiness in marriage is entirely a matter of chance. If the dispositions of the parties are ever so well known to each other or ever so similar beforehand, it does not advance their felicity in the least. They always continue to grow sufficiently unlike afterwards to have their share of vexation; and it is better to know as little as possible of the defects of the person with whom you are to pass your life."",
        "createdAt": "2019-04-17T08:44:37.000Z",
        "pageAt": "#305-308",
        "title": "Pride and Prejudice",
      },
    ]
  `)
})

test('parser: ric', () => {
  const file = readFile('../__fixtures__/clippings_ric.txt')
  const parser = new ClippingTextParser(file)
  const result = parser.execute()
  result.forEach((x) => {
    expect(x.bookId).toBeTruthy()
    expect(x.content).toBeTruthy()
    expect(x.pageAt).toBeTruthy()
  })

  expect(result).toMatchSnapshot()
  // c.Content == "" || c.BookID == "" || c.PageAt == ""
})

test('parser: xumeng', () => {
  const file = readFile('../__fixtures__/clippings_xm.txt')
  const parser = new ClippingTextParser(file)
  const result = parser.execute()
  result.forEach((x) => {
    expect(x.bookId).toBeTruthy()
    expect(x.content).toBeTruthy()
    expect(x.pageAt).toBeTruthy()
  })

  expect(result).toMatchSnapshot()
  // c.Content == "" || c.BookID == "" || c.PageAt == ""
})
