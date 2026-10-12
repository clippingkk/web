// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { headingPageAt, parseKindleNotebook } from '../kindle-notebook'

const fixture = (name: string) =>
  readFileSync(join(__dirname, '__fixtures__', name), 'utf8')

const notebook = (
  body: string
) => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "XHTML1-s.dtd" >
<html><head><meta charset="UTF-8"><style>.noteText { color: #333 }</style></head>
<body><div class="bodyContainer">
<div class="notebookFor">Notebook Export</div>
<div class="bookTitle">Thinking, Fast and Slow (Daniel Kahneman)</div>
<div class="authors">Daniel Kahneman</div>
<div class="citation"></div>
<hr />
${body}
</div></body></html>`

const highlight = (location: string, text: string) =>
  `<div class="noteHeading">Highlight(<span class="annotation_yellow">yellow</span>) - ${location}</div>
<div class="noteText">${text}</div>`

const note = (location: string, text: string) =>
  `<div class="noteHeading">Note - ${location}</div>
<div class="noteText">${text}</div>`

describe('parseKindleNotebook', () => {
  it('reads every highlight of an iPhone notebook export', () => {
    const parsed = parseKindleNotebook(fixture('notebook.html'))!

    expect(parsed.title).toBe('经略幽燕：宋辽战争军事灾难的战略分析')
    expect(parsed.authors).toBe('曾瑞龙')
    expect(parsed.highlights).toHaveLength(22)
    expect(parsed.notes).toEqual([])
    expect(parsed.highlights[0]).toEqual({
      content:
        '在日常用語中，和平常常被賦予更積極的意義。所謂「維護世界和平」的口號中所講的「和平」，很難想像其內涵包括了互相確保摧毀在內。',
      pageAt: '#197',
    })
    expect(parsed.highlights.map((item) => item.pageAt)).toEqual(
      [
        197, 515, 551, 557, 1783, 1824, 1950, 2703, 3808, 3952, 3999, 4096,
        4109, 4356, 4797, 5097, 5456, 5473, 6095, 6749, 6757, 6896,
      ].map((location) => `#${location}`)
    )
    expect(parsed.highlights[21].content).toMatch(
      /^他們似乎忽略了.*招徠重大的失敗。$/
    )
  })

  it('keeps notes apart and links each to the highlight it follows', () => {
    const parsed = parseKindleNotebook(
      notebook(`<div class="sectionHeading">Part One</div>
${highlight('Location 120', 'System 1 operates automatically.')}
${note('Location 121', 'Fast &amp; intuitive')}
${note('Location 300', 'A standalone thought')}
<div class="noteHeading">Bookmark - Location 400</div>
<div class="noteText"></div>
${highlight('Location 410', 'Second highlight')}
<div class="sectionHeading">Part Two</div>
${note('Location 500', 'After a chapter break')}`)
    )!

    expect(parsed.title).toBe('Thinking, Fast and Slow')
    expect(parsed.highlights).toEqual([
      { content: 'System 1 operates automatically.', pageAt: '#120' },
      { content: 'Second highlight', pageAt: '#410' },
    ])
    expect(parsed.notes).toEqual([
      { content: 'Fast & intuitive', pageAt: '#121', highlight: 0 },
      { content: 'A standalone thought', pageAt: '#300', highlight: null },
      { content: 'After a chapter break', pageAt: '#500', highlight: null },
    ])
  })

  it('does not link a note across a bookmark', () => {
    const parsed = parseKindleNotebook(
      notebook(`${highlight('Location 1', 'Highlighted')}
<div class="noteHeading">Bookmark - Location 2</div>
${note('Location 3', 'Unrelated')}`)
    )!

    expect(parsed.notes).toEqual([
      { content: 'Unrelated', pageAt: '#3', highlight: null },
    ])
  })

  it('survives a noteText closed with the wrong tag', () => {
    const parsed = parseKindleNotebook(
      notebook(`<div class="noteHeading">Highlight(<span class="annotation_blue">blue</span>) - Location 1</div>
<div class="noteText">First<br/>second line</h3>
${highlight('Location 2', 'Next one')}
${note('Location 3', 'Mine')}`)
    )!

    expect(parsed.highlights).toEqual([
      { content: 'First\nsecond line', pageAt: '#1' },
      { content: 'Next one', pageAt: '#2' },
    ])
    expect(parsed.notes).toEqual([
      { content: 'Mine', pageAt: '#3', highlight: 1 },
    ])
  })

  it('recognises desktop colour classes', () => {
    const parsed = parseKindleNotebook(
      notebook(
        `<h3 class="noteHeading">Highlight (<span class="highlight_pink">pink</span>) - Page 3 · Location 45</h3><div class="noteText">From the desktop app</div>`
      )
    )!

    expect(parsed.highlights).toEqual([
      { content: 'From the desktop app', pageAt: '3' },
    ])
  })

  it('returns null for HTML that is not a notebook export', () => {
    expect(parseKindleNotebook('<p>Hello</p>')).toBeNull()
    expect(
      parseKindleNotebook(
        '<div class="noteHeading">Note - Location 1</div><div class="noteText">no title</div>'
      )
    ).toBeNull()
  })
})

describe('headingPageAt', () => {
  it.each([
    ['Highlight(yellow)\n - Location 197\n', '#197'],
    ['Highlight (yellow) - Page 12 · Location 197', '12'],
    ['Highlight (yellow) - Location 1,783', '#1783'],
    ['Highlight (yellow) - Chapter 1 > Page 3 · Location 45', '3'],
    ['Note - Page 7', '7'],
    ['标注(黄色) - 位置 197', '#197'],
    ['标注(黄色) - 第 12 页·位置 197', '12'],
    ['ハイライト(黄) - 位置No. 88', '#88'],
    ['Bookmark', ''],
  ])('%j → %j', (heading, pageAt) => {
    expect(headingPageAt(heading)).toBe(pageAt)
  })
})
