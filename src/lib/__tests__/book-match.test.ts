import {
  findBookByTitle,
  findRecommendedBook,
  shortBookTitle,
} from '../book-match'

const walden = {
  title: '瓦尔登湖',
  originTitle: 'Walden',
  author: '[美] 亨利·戴维·梭罗',
}
const trial = { title: 'Trial by Fire', author: 'Someone Else' }

describe('findBookByTitle', () => {
  it('folds case, punctuation, and subtitles', () => {
    expect(findBookByTitle('WALDEN (Annotated)', [walden])).toBe(walden)
    expect(findBookByTitle('瓦尔登湖:一本书', [walden])).toBe(walden)
  })

  it('does not match on one character', () => {
    expect(findBookByTitle('瓦', [walden])).toBeUndefined()
  })
})

describe('findRecommendedBook', () => {
  it('needs the author to agree too', () => {
    expect(
      findRecommendedBook({ title: 'Trial', author: 'Franz Kafka' }, [trial])
    ).toBeUndefined()
  })

  it('accepts the name as a catalogue prints it', () => {
    expect(
      findRecommendedBook({ title: '瓦尔登湖', author: '亨利·戴维·梭罗' }, [
        walden,
      ])
    ).toBe(walden)
    expect(
      findRecommendedBook({ title: '瓦尔登湖', author: '梭罗' }, [walden])
    ).toBe(walden)
  })

  it('leaves a book with no named author unmatched', () => {
    expect(
      findRecommendedBook({ title: 'Walden', author: 'Thoreau' }, [
        { title: 'Walden' },
      ])
    ).toBeUndefined()
  })
})

describe('shortBookTitle', () => {
  it('drops bracketed edition notes and sales copy', () => {
    expect(
      shortBookTitle(
        '瓦尔登湖（2024年精装本）（翻译泰斗实地调研，历时700天。）'
      )
    ).toBe('瓦尔登湖')
    expect(shortBookTitle('Walden (Annotated Edition)')).toBe('Walden')
  })

  it('keeps a title with nothing else to show', () => {
    expect(shortBookTitle('(美)无题')).toBe('(美)无题')
    expect(shortBookTitle('Middlemarch')).toBe('Middlemarch')
  })
})
