import {
  bookSummaryToMarkdown,
  passageNoteToText,
  recommendationsToMarkdown,
} from '../format'

test('a note reads as paragraphs and skips what the model left out', () => {
  expect(
    passageNoteToText({
      gist: 'Gist.',
      reading: 'Reading.',
      context: null,
      terms: [],
      question: 'Question?',
    })
  ).toBe('Gist.\n\nReading.\n\nQuestion?')
  expect(
    passageNoteToText({
      gist: 'Gist.',
      reading: 'Reading.',
      context: 'Context.',
      terms: [
        { term: 'A', meaning: 'one' },
        { term: 'B', meaning: 'two' },
      ],
      question: 'Question?',
    })
  ).toBe('Gist.\n\nReading.\n\nContext.\n\nA: one\nB: two\n\nQuestion?')
})

test('a summary copies as Markdown with its real highlights quoted', () => {
  const markdown = bookSummaryToMarkdown(
    'Walden',
    {
      thesis: 'Thesis.',
      themes: [
        { title: 'One', insight: 'First.', highlightRef: 1 },
        { title: 'Two', insight: 'Second.', highlightRef: 99 },
      ],
      question: 'Question?',
    },
    {
      total: 1,
      highlights: [{ ref: 1, id: 5, text: 'Line one\nLine two' }],
    }
  )
  expect(markdown).toBe(
    [
      '# Walden',
      'Thesis.',
      '## One',
      'First.',
      '> Line one\n> Line two',
      '## Two',
      'Second.',
      '*Question?*',
    ].join('\n\n')
  )
})

test('a list copies as Markdown', () => {
  expect(
    recommendationsToMarkdown('Picked for you', {
      portrait: 'Portrait.',
      picks: [
        {
          title: 'Book',
          author: 'Writer',
          kind: 'deeper',
          hook: 'Hook.',
          why: 'Why.',
          shelfRef: null,
        },
      ],
    })
  ).toBe('# Picked for you\n\nPortrait.\n\n## Book · Writer\n\nHook.\n\nWhy.')
})
