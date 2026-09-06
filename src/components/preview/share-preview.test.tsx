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
vi.mock('./share-image', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  capturePoster: mocks.capture,
  prepareImage: mocks.prepare,
  decodeImages: vi.fn().mockResolvedValue(undefined),
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
  expect((screen.getByText('Noir') as HTMLButtonElement).disabled).toBe(true)
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
