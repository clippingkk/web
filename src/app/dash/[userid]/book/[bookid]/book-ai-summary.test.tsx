import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'

import ai from '@/locales/en/ai.json'

const hook = vi.hoisted(() => ({
  state: {} as Record<string, unknown>,
  generate: vi.fn(),
  stop: vi.fn(),
  options: vi.fn(),
}))

vi.mock('@/hooks/use-ai-object', () => ({
  useAIObject: (options: unknown) => {
    hook.options(options)
    return { ...hook.state, generate: hook.generate, stop: hook.stop }
  },
}))
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

import BookAiSummary from './book-ai-summary'

const SUMMARY = {
  thesis: 'A deliberate life begins with subtraction.',
  themes: [
    { title: 'Subtraction', insight: 'Less is the method.', highlightRef: 2 },
    { title: 'Solitude', insight: 'Quiet is the point.', highlightRef: 99 },
  ],
  question: 'What would you give up?',
}
const CONTEXT = {
  total: 212,
  highlights: [
    { ref: 1, id: 41, text: 'I went to the woods.' },
    { ref: 2, id: 42, text: 'Simplify, simplify.' },
  ],
}
const idle = {
  result: null,
  draft: null,
  context: null,
  isLoading: false,
  error: undefined,
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function renderSummary(
  access: 'free' | 'premium',
  state: Record<string, unknown> = idle,
  initial: Parameters<typeof BookAiSummary>[0]['initial'] = null
) {
  hook.state = state
  return render(
    <BookAiSummary
      bookId="42"
      title="Walden"
      owner="reader"
      access={access}
      initial={initial}
    />
  )
}

it('offers a free reader Premium and never loads the hook', () => {
  renderSummary('free')
  expect(screen.getByText(ai.bookSummary.premiumDescription)).toBeTruthy()
  expect(screen.getByRole('link', { name: /See Premium/ })).toBeTruthy()
  expect(hook.options).not.toHaveBeenCalled()
})

it('starts with one clear action that does not call the model on its own', () => {
  renderSummary('premium')
  expect(screen.getByText(ai.bookSummary.description)).toBeTruthy()
  expect(hook.generate).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: ai.bookSummary.generate }))
  expect(hook.generate).toHaveBeenCalledWith({ bookId: '42', force: false })
})

it('shows progress before the first word', () => {
  renderSummary('premium', { ...idle, isLoading: true })
  expect(screen.getByText(ai.bookSummary.working)).toBeTruthy()
  expect(screen.getByRole('button', { name: ai.actions.stop })).toBeTruthy()
})

it('renders the fields that have arrived while the rest are still coming', () => {
  renderSummary('premium', {
    ...idle,
    isLoading: true,
    context: CONTEXT,
    draft: { thesis: 'A deliberate', themes: [{ title: 'Subtr' }] },
  })
  expect(screen.getByText('A deliberate')).toBeTruthy()
  expect(screen.getByRole('heading', { name: 'Subtr' })).toBeTruthy()
  expect(screen.queryByText(ai.bookSummary.working)).toBeNull()
  expect(screen.queryByText(ai.bookSummary.question)).toBeNull()
  expect(screen.queryByRole('button', { name: ai.actions.copy })).toBeNull()
})

it('shows a stored summary with real, linked highlights and its source', () => {
  const stored = { object: SUMMARY, context: CONTEXT }
  renderSummary(
    'premium',
    { ...idle, result: stored, context: CONTEXT },
    stored
  )
  expect(hook.generate).not.toHaveBeenCalled()
  expect(hook.options).toHaveBeenCalledWith(
    expect.objectContaining({ initial: stored })
  )
  expect(screen.getByText(SUMMARY.thesis)).toBeTruthy()
  expect(screen.getByText(SUMMARY.question)).toBeTruthy()
  expect(
    screen.getByText('Simplify, simplify.').closest('a')?.getAttribute('href')
  ).toBe('/dash/reader/clippings/42')
  // The model named a highlight that does not exist, so nothing is quoted.
  expect(screen.getAllByRole('blockquote')).toHaveLength(1)
  expect(
    screen.getByText('From 2 of your 212 highlights. Written by AI.')
  ).toBeTruthy()
})

it('copying and asking again are one click once it has finished', () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
  const stored = { object: SUMMARY, context: CONTEXT }
  renderSummary(
    'premium',
    { ...idle, result: stored, context: CONTEXT },
    stored
  )

  fireEvent.click(screen.getByRole('button', { name: ai.actions.copy }))
  expect(writeText.mock.calls[0][0]).toContain('# Walden')
  expect(writeText.mock.calls[0][0]).toContain('> Simplify, simplify.')

  fireEvent.click(screen.getByRole('button', { name: ai.actions.rewrite }))
  expect(hook.generate).toHaveBeenCalledWith({ bookId: '42', force: true })
  vi.unstubAllGlobals()
})

it('a failure keeps the old summary and offers a way forward', () => {
  const stored = { object: SUMMARY, context: CONTEXT }
  renderSummary(
    'premium',
    {
      ...idle,
      result: stored,
      context: CONTEXT,
      error: Object.assign(new Error('provider said something'), {
        code: 'AI_GENERATION_FAILED',
      }),
    },
    stored
  )
  expect(screen.getByRole('alert').textContent).toContain(ai.errors.generic)
  expect(screen.queryByText('provider said something')).toBeNull()
  expect(screen.getByText(SUMMARY.thesis)).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: ai.actions.retry }))
  expect(hook.generate).toHaveBeenCalledWith({ bookId: '42', force: true })
})

it('names a known error in the reader’s language', () => {
  renderSummary('premium', {
    ...idle,
    error: Object.assign(new Error('x'), { code: 'AI_UNAVAILABLE' }),
  })
  expect(screen.getByRole('alert').textContent).toContain(
    ai.errors.AI_UNAVAILABLE
  )
  fireEvent.click(screen.getByRole('button', { name: ai.actions.retry }))
  expect(hook.generate).toHaveBeenCalledWith({ bookId: '42', force: false })
})
