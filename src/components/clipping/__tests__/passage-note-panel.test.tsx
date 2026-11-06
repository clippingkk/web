import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

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
vi.mock('@/i18n/language', () => ({ getLanguage: () => 'ko' }))
vi.mock('@/i18n/client', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const value = key.split('.').reduce<unknown>((node, part) => {
        if (node && typeof node === 'object' && part in node)
          return (node as Record<string, unknown>)[part]
        return undefined
      }, ai)
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

import PassageNotePanel from '../passage-note-panel'

const NOTE = {
  gist: 'A plain statement.',
  reading: 'Something beneath it.',
  context: null,
  terms: [{ term: 'Walden', meaning: 'A pond in Massachusetts.' }],
  question: 'What would you subtract?',
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

function renderPanel(
  access: 'anonymous' | 'free' | 'premium',
  state: Record<string, unknown> = idle
) {
  hook.state = state
  return render(
    <PassageNotePanel clippingId={7} access={access} initial={null} />
  )
}

it('stays out of the way of signed-out readers', () => {
  const { container } = renderPanel('anonymous')
  expect(container.innerHTML).toBe('')
  expect(hook.options).not.toHaveBeenCalled()
})

it('offers a free reader Premium without loading the hook', () => {
  renderPanel('free')
  expect(screen.getByText(ai.passageNote.premiumDescription)).toBeTruthy()
  expect(hook.options).not.toHaveBeenCalled()
})

it('explains on one click, in the reader’s language', () => {
  renderPanel('premium')
  expect(hook.generate).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: ai.passageNote.generate }))
  expect(hook.generate).toHaveBeenCalledWith({
    clippingId: 7,
    language: 'ko',
    force: false,
  })
})

it('renders each finished part, and leaves out what the model left out', () => {
  renderPanel('premium', {
    ...idle,
    result: { object: NOTE, context: null },
  })
  expect(screen.getByText(NOTE.gist)).toBeTruthy()
  expect(screen.getByText(NOTE.reading)).toBeTruthy()
  expect(screen.getByText(NOTE.question)).toBeTruthy()
  expect(screen.getByText('Walden')).toBeTruthy()
  expect(screen.queryByText(ai.passageNote.context)).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: ai.actions.rewrite }))
  expect(hook.generate).toHaveBeenCalledWith({
    clippingId: 7,
    language: 'ko',
    force: true,
  })
})

it('shows progress, then the first field as it arrives', () => {
  const view = renderPanel('premium', { ...idle, isLoading: true })
  expect(screen.getByText(ai.passageNote.working)).toBeTruthy()
  hook.state = { ...idle, isLoading: true, draft: { gist: 'A plain' } }
  view.rerender(
    <PassageNotePanel clippingId={7} access="premium" initial={null} />
  )
  expect(screen.getByText('A plain')).toBeTruthy()
  expect(screen.queryByText(ai.passageNote.working)).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: ai.actions.stop }))
  expect(hook.stop).toHaveBeenCalled()
})

it('offers a retry when it fails before any word', () => {
  renderPanel('premium', { ...idle, error: new Error('nope') })
  expect(screen.getByRole('alert').textContent).toContain(ai.errors.generic)
  fireEvent.click(screen.getByRole('button', { name: ai.actions.retry }))
  expect(hook.generate).toHaveBeenCalledWith({
    clippingId: 7,
    language: 'ko',
    force: false,
  })
})
