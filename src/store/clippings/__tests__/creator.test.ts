import { toClippingInput } from '../creator'

test('creates a valid GraphQL clipping input', () => {
  const clipping = {
    title: '秦汉史讲义',
    pageAt: '#7025-7030',
    createdAt: '2026-02-02T10:16:10.000Z',
    content: '历史的发展是不确定的',
    bookId: '37005453',
    _digest: '29ffc0336e9382adcee4daa728992a14f072e4a8',
  }

  expect(toClippingInput(clipping)).toStrictEqual({
    bookID: '37005453',
    content: '历史的发展是不确定的',
    createdAt: '2026-02-02T10:16:10.000Z',
    pageAt: '#7025-7030',
    title: '秦汉史讲义',
  })
})
