import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'

import library from '@/locales/en/library.json'

const generation = vi.hoisted(() => ({
  state: {
    text: '',
    isLoading: false,
    error: undefined as Error | undefined,
  },
  useAIGeneration: vi.fn(),
}))

vi.mock('@/hooks/use-ai-generation', () => ({
  useAIGeneration: generation.useAIGeneration,
}))
vi.mock('@/i18n/client', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const value = key.split('.').reduce<unknown>((node, part) => {
        if (node && typeof node === 'object' && part in node)
          return (node as Record<string, unknown>)[part]
        return undefined
      }, library)
      return typeof value === 'string' ? value : key
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

afterEach(() => {
  cleanup()
  generation.state = { text: '', isLoading: false, error: undefined }
})

const props = {
  bookId: '42',
  title: 'Walden',
  author: 'Thoreau',
}

function renderSummary(
  access: 'free' | 'premium',
  initialSummary: string | null = null
) {
  generation.useAIGeneration.mockImplementation(() => generation.state)
  const view = render(
    <BookAiSummary {...props} access={access} initialSummary={initialSummary} />
  )
  return {
    ...view,
    rerenderSummary() {
      view.rerender(
        <BookAiSummary
          {...props}
          access={access}
          initialSummary={initialSummary}
        />
      )
    },
  }
}

it('shows a Premium reader a generate button and then the streamed summary', () => {
  const view = renderSummary('premium')
  expect(document.querySelector('details')?.open).toBe(true)
  expect(screen.getByText(library.book.ai.description)).toBeTruthy()
  expect(generation.useAIGeneration).toHaveBeenLastCalledWith(
    'book',
    expect.objectContaining({ bookId: '42', force: false }),
    false
  )

  generation.state = {
    text: 'A quiet book about living deliberately.',
    isLoading: true,
    error: undefined,
  }
  fireEvent.click(
    screen.getByRole('button', { name: library.book.ai.generate })
  )
  expect(
    screen.getByText('A quiet book about living deliberately.')
  ).toBeTruthy()
  expect(generation.useAIGeneration).toHaveBeenLastCalledWith(
    'book',
    expect.objectContaining({
      bookId: '42',
      title: 'Walden',
      run: 1,
      force: false,
    }),
    true
  )

  generation.state = {
    text: 'A quiet book about living deliberately.',
    isLoading: false,
    error: undefined,
  }
  view.rerenderSummary()
  fireEvent.click(
    screen.getByRole('button', { name: library.book.ai.regenerate })
  )
  fireEvent.click(
    screen.getByRole('button', { name: library.book.ai.regenerate })
  )
  expect(generation.useAIGeneration).toHaveBeenLastCalledWith(
    'book',
    expect.objectContaining({ run: 3, force: true }),
    true
  )
})

it('shows a stored summary without starting a request, and bills only when asked again', () => {
  const view = renderSummary('premium', 'Cached summary of the highlights.')
  expect(screen.getByText('Cached summary of the highlights.')).toBeTruthy()
  expect(generation.useAIGeneration).toHaveBeenLastCalledWith(
    'book',
    expect.anything(),
    false
  )
  fireEvent.click(
    screen.getByRole('button', { name: library.book.ai.regenerate })
  )
  expect(generation.useAIGeneration).toHaveBeenLastCalledWith(
    'book',
    expect.objectContaining({ run: 1, force: true }),
    true
  )
  generation.state = {
    text: 'A second draft.',
    isLoading: false,
    error: undefined,
  }
  view.rerenderSummary()
  fireEvent.click(
    screen.getByRole('button', { name: library.book.ai.regenerate })
  )
  expect(generation.useAIGeneration).toHaveBeenLastCalledWith(
    'book',
    expect.objectContaining({ run: 2, force: true }),
    true
  )
})

it('tells a free reader how to get summaries and does not generate', () => {
  renderSummary('free')
  expect(screen.getByText(library.book.ai.premiumDescription)).toBeTruthy()
  expect(
    screen
      .getByRole('link', { name: library.book.ai.upgrade })
      .getAttribute('href')
  ).toBe('/pricing')
  expect(
    screen.queryByRole('button', { name: library.book.ai.generate })
  ).toBeNull()
  expect(
    generation.useAIGeneration.mock.calls.every((call) => call[2] === false)
  ).toBe(true)
})
