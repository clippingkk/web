import ClippingTextParser from "../parser";
import fs from 'fs'
import path from 'path'

function readFile(p) {
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
