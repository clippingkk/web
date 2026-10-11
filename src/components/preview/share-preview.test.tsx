import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import type { WenquBook } from '@/services/wenqu'

import SharePreview from './share-preview'

const mocks = vi.hoisted(() => ({
  capture: vi.fn(),
  prepare: vi.fn(),
  save: vi.fn(),
  success: vi.fn(),
  shuffle: vi.fn(),
  highlightsOptions: vi.fn(),
  highlights: {} as {
    highlights: { id: number; content: string; visible: boolean }[]
    status: 'idle' | 'loading' | 'ready' | 'error'
    canShuffle: boolean
  },
}))
vi.mock('@annatarhe/lake-ui/modal', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))
vi.mock('@/i18n/client', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'en' },
  }),
}))
vi.mock('file-saver', () => ({ default: { saveAs: mocks.save } }))
vi.mock('react-hot-toast', () => ({ toast: { success: mocks.success } }))
vi.mock('./use-book-highlights', () => ({
  useBookHighlights: (options: { enabled: boolean }) => {
    mocks.highlightsOptions(options)
    return { ...mocks.highlights, shuffle: mocks.shuffle, retry: vi.fn() }
  },
}))
vi.mock('./share-image', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  capturePoster: mocks.capture,
  prepareImage: mocks.prepare,
  decodeImages: vi.fn().mockResolvedValue(undefined),
  loadPosterFonts: vi.fn().mockResolvedValue(undefined),
}))

const data = {
  book: {
    title: 'Book',
    author: 'Author',
    image: 'https://example.com/cover.png',
    doubanId: 12,
    summary: 'Summary',
  } as WenquBook,
  uid: 7,
}

beforeEach(() => {
  mocks.highlights = { highlights: [], status: 'ready', canShuffle: false }
  mocks.prepare.mockResolvedValue('data:image/png;base64,AA==')
  mocks.capture.mockResolvedValue(new Blob(['png'], { type: 'image/png' }))
})
afterEach(cleanup)

it('requires original assets and supports retry before allowing save', async () => {
  mocks.prepare.mockRejectedValueOnce(new Error('CORS'))
  render(<SharePreview opened onCancel={() => {}} data={data} />)
  const save = screen.getByRole('button', {
    name: 'app.clipping.save',
  }) as HTMLButtonElement
  expect(save.disabled).toBe(true)
  await screen.findByText('app.sharePoster.assetsError')
  expect(save.disabled).toBe(true)
  fireEvent.click(screen.getByText('app.sharePoster.retry'))
  await waitFor(() => expect(save.disabled).toBe(false))
  fireEvent.click(save)
  await waitFor(() =>
    expect(mocks.save).toHaveBeenCalledWith(
      expect.any(Blob),
      'clippingkk-Book-Author-share.png'
    )
  )
})

it('freezes themes, prevents duplicate capture, and discards results after close', async () => {
  let finish!: (blob: Blob) => void
  mocks.capture.mockImplementation(
    () =>
      new Promise<Blob>((resolve) => {
        finish = resolve
      })
  )
  const view = render(<SharePreview opened onCancel={() => {}} data={data} />)
  const save = screen.getByRole('button', {
    name: 'app.clipping.save',
  }) as HTMLButtonElement
  await waitFor(() => expect(save.disabled).toBe(false))
  fireEvent.click(save)
  fireEvent.click(save)
  expect(mocks.capture).toHaveBeenCalledTimes(1)
  expect(
    (screen.getByRole('button', { name: 'Noir' }) as HTMLButtonElement).disabled
  ).toBe(true)
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).disabled).toBe(
    true
  )
  view.rerender(<SharePreview opened={false} onCancel={() => {}} data={data} />)
  await act(async () => finish(new Blob(['png'], { type: 'image/png' })))
  expect(mocks.save).not.toHaveBeenCalled()
  expect(mocks.success).not.toHaveBeenCalled()
})

it('discards an in-flight image after the content changes', async () => {
  let finish!: (blob: Blob) => void
  mocks.capture.mockImplementationOnce(
    () =>
      new Promise<Blob>((resolve) => {
        finish = resolve
      })
  )
  const view = render(<SharePreview opened onCancel={() => {}} data={data} />)
  await waitFor(() =>
    expect(
      (
        screen.getByRole('button', {
          name: 'app.clipping.save',
        }) as HTMLButtonElement
      ).disabled
    ).toBe(false)
  )
  fireEvent.click(screen.getByRole('button', { name: 'app.clipping.save' }))
  view.rerender(
    <SharePreview
      opened
      onCancel={() => {}}
      data={{ ...data, book: { ...data.book, title: 'New book' } }}
    />
  )
  await act(async () => finish(new Blob(['png'], { type: 'image/png' })))
  expect(mocks.save).not.toHaveBeenCalled()
  expect(screen.getByText('New book')).toBeDefined()
})

it('sets the note on the poster and keeps the draft after closing', async () => {
  const view = render(<SharePreview opened onCancel={() => {}} data={data} />)
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'Read it twice.' },
  })
  expect(screen.getByText('Read it twice.', { selector: 'p' })).toBeDefined()
  expect(screen.getByText('app.sharePoster.noteLabel')).toBeDefined()
  expect(screen.getByText('14/280')).toBeDefined()
  view.rerender(<SharePreview opened={false} onCancel={() => {}} data={data} />)
  expect(screen.queryByText('Read it twice.', { selector: 'p' })).toBeNull()
  view.rerender(<SharePreview opened onCancel={() => {}} data={data} />)
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe(
    'Read it twice.'
  )
  expect(screen.getByText('Read it twice.', { selector: 'p' })).toBeDefined()
})

it('waits for highlights, sets them on the book poster, and shuffles', async () => {
  mocks.highlights = { highlights: [], status: 'loading', canShuffle: false }
  const view = render(
    <SharePreview
      opened
      onCancel={() => {}}
      data={{ ...data, clippingsCount: 40 }}
    />
  )
  expect(mocks.highlightsOptions).toHaveBeenLastCalledWith({
    bookId: 12,
    uid: 7,
    total: 40,
    enabled: true,
  })
  const save = screen.getByRole('button', {
    name: 'app.clipping.save',
  }) as HTMLButtonElement
  await act(async () => {})
  expect(save.disabled).toBe(true)
  mocks.highlights = {
    highlights: [
      { id: 1, content: 'First line', visible: true },
      { id: 2, content: 'Second line', visible: true },
      { id: 3, content: 'Third line', visible: true },
    ],
    status: 'ready',
    canShuffle: true,
  }
  view.rerender(
    <SharePreview
      opened
      onCancel={() => {}}
      data={{ ...data, clippingsCount: 40 }}
    />
  )
  await waitFor(() => expect(save.disabled).toBe(false))
  expect(screen.getByText('Second line')).toBeDefined()
  expect(screen.getByText('3 / 40')).toBeDefined()
  fireEvent.click(
    screen.getByRole('button', { name: 'app.sharePoster.shuffle' })
  )
  expect(mocks.shuffle).toHaveBeenCalledTimes(1)
})

it('leaves highlights off clipping posters', () => {
  render(
    <SharePreview
      opened
      onCancel={() => {}}
      data={{
        ...data,
        clipping: {
          id: 8,
          title: 'Book',
          content: 'A quote',
          createdAt: '2024-01-01T00:00:00Z',
          creator: { id: 7, name: 'Reader', avatar: '' },
        },
      }}
    />
  )
  expect(mocks.highlightsOptions).toHaveBeenLastCalledWith(
    expect.objectContaining({ enabled: false })
  )
  expect(screen.queryByText('app.sharePoster.highlights')).toBeNull()
  expect((screen.getByRole('textbox') as HTMLTextAreaElement).placeholder).toBe(
    'app.sharePoster.notePlaceholderClipping'
  )
})
