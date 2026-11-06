import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

import ai from '@/locales/en/ai.json'

const hook = vi.hoisted(() => ({
  state: {} as Record<string, unknown>,
  generate: vi.fn(),
  stop: vi.fn(),
  options: vi.fn(),
  search: vi.fn(),
}))

vi.mock('@/hooks/use-ai-object', () => ({
  useAIObject: (options: unknown) => {
    hook.options(options)
    return { ...hook.state, generate: hook.generate, stop: hook.stop }
  },
}))
vi.mock('@/hooks/book', () => ({ useBookSearch: hook.search }))
vi.mock('@/i18n/language', () => ({ getLanguage: () => 'zhCN' }))
vi.mock('@/i18n/client', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, unknown>) => {
      const value = key.split('.').reduce<unknown>((node, part) => {
        if (node && typeof node === 'object' && part in node)
          return (node as Record<string, unknown>)[part]
        return undefined
      }, ai)
      if (typeof value !== 'string') return key
      return Object.entries(values ?? {}).reduce(
        (text, [name, replacement]) =>
          text.replace(`{{${name}}}`, String(replacement)),
        value
      )
    },
  }),
}))
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: ReactNode
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))
vi.mock('@annatarhe/blurhash-react', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}))

import AIBookRecommendationButton from '../ai-book-recommendation-button'

const LIST = {
  portrait: 'You are looking for a quieter life.',
  picks: [
    {
      title: 'The Peregrine',
      author: 'J. A. Baker',
      kind: 'wildcard',
      hook: 'A man follows falcons until he nearly becomes one.',
      why: 'Your Walden highlights keep choosing attention over comfort.',
      shelfRef: 1,
    },
    {
      title: 'Unknown Book',
      author: 'Nobody',
      kind: 'deeper',
      hook: 'A hook.',
      why: 'A reason.',
      shelfRef: null,
    },
  ],
}
const CONTEXT = {
  shelf: [{ ref: 1, title: 'Walden', bookId: '2222' }],
}
const idle = {
  result: null,
  draft: null,
  context: null,
  isLoading: false,
  error: undefined,
}

beforeEach(() => {
  hook.search.mockImplementation(
    (query: string, _: number, enabled: boolean) => ({
      data:
        enabled && query === 'The Peregrine'
          ? {
              books: [
                {
                  title: 'The Peregrine',
                  author: 'J. A. Baker',
                  rating: 9.1,
                  url: 'https://book.douban.com/subject/1/',
                  image: 'https://img/1.jpg',
                },
              ],
            }
          : undefined,
    })
  )
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function open(isPremium: boolean, state: Record<string, unknown> = idle) {
  hook.state = state
  render(<AIBookRecommendationButton owner="reader" isPremium={isPremium} />)
  fireEvent.click(screen.getByRole('button', { name: ai.recommendations.open }))
}

it('never calls the model for a free reader', () => {
  open(false)
  expect(screen.getByText(ai.recommendations.premiumDescription)).toBeTruthy()
  expect(hook.options).not.toHaveBeenCalled()
  expect(hook.generate).not.toHaveBeenCalled()
})

it('one click opens the sheet and starts writing in the reader’s language', () => {
  hook.state = idle
  render(<AIBookRecommendationButton owner="reader" isPremium />)
  expect(hook.generate).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: ai.recommendations.open }))
  expect(hook.generate).toHaveBeenCalledWith({
    language: 'zhCN',
    force: false,
  })
})

it('reopening does not generate again', () => {
  open(true, { ...idle, result: { object: LIST, context: CONTEXT } })
  expect(hook.generate).not.toHaveBeenCalled()
})

it('fills in books as they arrive and holds back the catalogue lookup', () => {
  open(true, {
    ...idle,
    isLoading: true,
    context: CONTEXT,
    draft: {
      portrait: 'You are looking',
      picks: [{ title: 'The Pereg', kind: 'wildcard' }],
    },
  })
  expect(screen.getByText('You are looking')).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'The Pereg' })).toBeTruthy()
  expect(screen.getByText(ai.recommendations.kinds.wildcard)).toBeTruthy()
  expect(hook.search).toHaveBeenCalledWith('The Pereg', 0, false)
  expect(screen.getByRole('button', { name: ai.actions.stop })).toBeTruthy()
})

it('shows covers and links only when the catalogue agrees', () => {
  open(true, {
    ...idle,
    result: { object: LIST, context: CONTEXT },
    context: CONTEXT,
  })
  expect(screen.getByText(LIST.portrait)).toBeTruthy()
  expect(screen.getByAltText('The Peregrine')).toBeTruthy()
  expect(screen.getByText('9.1')).toBeTruthy()
  const links = screen.getAllByRole('link', {
    name: ai.recommendations.viewBook,
  })
  expect(links).toHaveLength(1)
  expect(links[0].getAttribute('href')).toBe(
    'https://book.douban.com/subject/1/'
  )
  expect(
    screen
      .getByRole('link', { name: 'Because you read Walden' })
      .getAttribute('href')
  ).toBe('/dash/reader/book/2222')
  // The book the catalogue does not know still shows, on a plain cover.
  expect(screen.getByRole('heading', { name: 'Unknown Book' })).toBeTruthy()
})

it('asking again is one click and tells the server to write anew', () => {
  open(true, {
    ...idle,
    result: { object: LIST, context: CONTEXT },
    context: CONTEXT,
  })
  fireEvent.click(screen.getByRole('button', { name: ai.actions.rewrite }))
  expect(hook.generate).toHaveBeenCalledWith({
    language: 'zhCN',
    force: true,
  })
})

it('a first failure has a way forward', () => {
  open(true, {
    ...idle,
    error: Object.assign(new Error('x'), { code: 'NOT_FOUND' }),
  })
  expect(screen.getByRole('alert').textContent).toContain(ai.errors.NOT_FOUND)
  hook.generate.mockClear()
  fireEvent.click(screen.getByRole('button', { name: ai.actions.retry }))
  expect(hook.generate).toHaveBeenCalledWith({
    language: 'zhCN',
    force: false,
  })
})
