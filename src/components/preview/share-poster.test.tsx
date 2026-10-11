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
  it('sets Chinese in LXGW WenKai and English in Literata', () => {
    const render = (content: string, author: string) =>
      renderToStaticMarkup(
        <SharePoster
          data={{
            book: { ...book, author },
            uid: 7,
            clipping: {
              id: 8,
              title: '',
              content,
              createdAt: 'invalid',
              creator: { id: 9, name: 'Reader', avatar: '' },
            },
          }}
          theme={themes[0].id}
          images={{}}
          origin="https://example.com"
          locale="en"
          label="READ"
        />
      )
    const quote = (html: string) =>
      html.match(/<blockquote style="([^"]*)"/)?.[1]
    const chinese = render('“阅读”……是一种 lifestyle', '鲁迅')
    expect(quote(chinese)).toContain(
      'font-family:&quot;LXGW WenKai&quot;, &quot;Literata&quot;, serif'
    )
    expect(chinese).not.toContain('font-style:italic')
    const english = render('Remember every word.', 'Jane Austen')
    expect(quote(english)).toContain(
      'font-family:&quot;Literata&quot;, &quot;LXGW WenKai&quot;, serif'
    )
    expect(english).toContain('font-style:italic')
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
  it('sets a non-blank note in the script it is written in', () => {
    const render = (note: string, clipping = true) =>
      renderToStaticMarkup(
        <SharePoster
          data={
            clipping
              ? {
                  ...data,
                  clipping: {
                    id: 8,
                    title: '',
                    content: 'Quote',
                    createdAt: 'invalid',
                    creator: { id: 9, name: 'Reader', avatar: '' },
                  },
                }
              : data
          }
          theme={themes[0].id}
          images={{}}
          origin="https://example.com"
          locale="en"
          label="READ"
          note={note}
          noteLabel="MY NOTE"
        />
      )
    expect(render('  \n ')).not.toContain('MY NOTE')
    const english = render('  Worth a second read.\n\n\n\nTruly.  ')
    expect(english).toContain('MY NOTE')
    expect(english).toContain('Worth a second read.\n\nTruly.')
    expect(english).toMatch(/font-style:italic[^>]*>Worth a second read/)
    const chinese = render('值得再读一遍。', false)
    expect(chinese).toContain('值得再读一遍。')
    expect(chinese).not.toMatch(/font-style:italic[^>]*>值得/)
  })
  it('shows highlights on book posters with the shelf count', () => {
    const summary = 'A long summary. '.repeat(40)
    const highlights = [
      { id: 1, content: 'First highlight.' },
      { id: 2, content: '第二条书摘。' },
      { id: 3, content: 'A very long highlight. '.repeat(30) },
    ]
    const render = (value: PosterData) =>
      renderToStaticMarkup(
        <SharePoster
          data={value}
          theme={themes[2].id}
          images={{}}
          origin="https://example.com"
          locale="en"
          label="BOOK"
          highlights={highlights}
          highlightsLabel="HIGHLIGHTS"
        />
      )
    const html = render({
      ...data,
      book: { ...book, summary },
      clippingsCount: 42,
    })
    expect(html).toContain('HIGHLIGHTS')
    expect(html).toContain('3 / 42')
    expect(html).toContain('First highlight.')
    expect(html).toContain('第二条书摘。')
    expect(html).not.toContain(highlights[2].content.trim())
    expect(html).not.toContain(summary.trim())
    expect(html.match(/<figure/g)).toHaveLength(3)
    // A clipping poster never shows the book's highlights.
    const quote = render({
      ...data,
      clipping: {
        id: 8,
        title: '',
        content: 'Quote',
        createdAt: 'invalid',
        creator: { id: 9, name: 'Reader', avatar: '' },
      },
    })
    expect(quote).not.toContain('HIGHLIGHTS')
  })
})
