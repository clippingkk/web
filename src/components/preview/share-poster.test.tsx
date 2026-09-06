import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { WenquBook } from '@/services/wenqu'

import SharePoster, { type PosterData, posterLink } from './share-poster'
import { themes } from './theme.config'

export const book = {
  id: 1,
  doubanId: 12345,
  title: 'A book',
  author: 'Author',
  summary: '第一段\nSecond paragraph',
  image: '',
} as WenquBook
const data: PosterData = { book, uid: 7 }

describe('share posters', () => {
  it('uses Douban IDs for book links and creator IDs for clipping links', () => {
    expect(posterLink(data, 'https://example.com')).toBe(
      'https://example.com/dash/7/book/12345'
    )
    expect(
      posterLink(
        {
          ...data,
          clipping: {
            id: 8,
            title: '',
            content: '',
            createdAt: '',
            creator: { id: 9, name: '', avatar: '' },
          },
        },
        'https://example.com'
      )
    ).toBe('https://example.com/dash/9/clippings/8')
  })
  for (const theme of themes) {
    it(`renders complete multilingual content in ${theme.name}`, () => {
      const content = '阅读\nRemember every word. '.repeat(100)
      const clipping = {
        id: 8,
        title: '',
        content,
        createdAt: 'invalid',
        creator: { id: 9, name: 'Reader', avatar: '' },
      }
      const render = (value: PosterData) =>
        renderToStaticMarkup(
          <SharePoster
            data={value}
            theme={theme.id}
            images={{}}
            origin="https://example.com"
            locale="en"
            label="READ"
          />
        )
      const html = render({ ...data, clipping })
      expect(html).toContain(content)
      expect(html).toContain('Reader')
      expect(html).not.toContain('<img')
      expect(html).toContain('width:375px')
      expect(render(data)).toContain(book.summary)
    })
  }
})
