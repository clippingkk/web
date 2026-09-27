import { describe, expect, it } from 'vitest'

import {
  pickFeaturedClippings,
  pickReaders,
  pickShelfBooks,
  type PublicClipping,
  type PublicReader,
} from '../landing-data'

const quote = 'A passage long enough to be worth showing on the landing page.'

function clipping(
  id: number,
  creatorId: number,
  bookID = `1000${id}`,
  content = quote
): PublicClipping {
  return {
    id,
    content,
    bookID,
    title: `Book ${bookID}`,
    createdAt: '2026-01-01T00:00:00.000Z',
    creator: {
      id: creatorId,
      name: `Reader ${creatorId}`,
      avatar: '',
      domain: '',
    },
  }
}

function reader(id: number, name: string, avatar?: string): PublicReader {
  return {
    id,
    name,
    avatar: avatar ?? '',
    domain: '',
    premiumEndAt: '',
  }
}

describe('pickFeaturedClippings', () => {
  it('prefers one readable quote per reader', () => {
    const picked = pickFeaturedClippings(
      [
        clipping(1, 1),
        clipping(2, 1),
        clipping(3, 2, '10003', 'Too short'),
        clipping(4, 3),
        clipping(5, 4),
      ],
      3
    )
    expect(picked.map((c) => c.id)).toEqual([1, 4, 5])
  })

  it('fills up with whatever is left when readers repeat', () => {
    const picked = pickFeaturedClippings(
      [clipping(1, 1), clipping(2, 1), clipping(3, 1, '10003', 'Short one')],
      3
    )
    expect(picked.map((c) => c.id)).toEqual([1, 2, 3])
  })
})

describe('pickShelfBooks', () => {
  it('links each book to a reader whose public highlights include it', () => {
    const shelf = pickShelfBooks(
      {
        books: [
          { doubanId: '20002', clippingsCount: 40 },
          { doubanId: '99999', clippingsCount: 30 },
          { doubanId: '20002', clippingsCount: 12 },
        ] as never,
        clippings: [
          clipping(1, 7, '10001'),
          clipping(2, 8, '20002'),
          clipping(3, 9, ''),
        ],
      },
      6
    )
    expect(shelf.map((b) => [b.doubanId, b.owner.id])).toEqual([
      ['20002', 8],
      ['10001', 7],
    ])
    expect(shelf[0].clippingsCount).toBe(40)
  })
})

describe('pickReaders', () => {
  it('skips unnamed readers and puts readers with a photo first', () => {
    const picked = pickReaders(
      [
        reader(1, 'Ann'),
        reader(2, 'user.12345', 'a.png'),
        reader(3, 'Bo', 'b.png'),
        reader(4, 'Cy', 'null'),
      ],
      10
    )
    expect(picked.map((r) => r.id)).toEqual([3, 1, 4])
  })
})
