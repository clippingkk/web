import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

import en from '@/locales/en/settings.json'
import type { InboundEmailSummary } from '@/server/email-import/records'

// getTranslation reads the language cookie; no cookie means English.
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => undefined }),
}))

import InboundEmailList from '../inbound-email-list'

afterEach(cleanup)

const email = (
  overrides: Partial<InboundEmailSummary> = {}
): InboundEmailSummary => ({
  id: 1,
  sender: 'reader@icloud.com',
  subject: 'iPhone Notebook export for Walden',
  status: 'imported',
  detail: null,
  dmarc: 'pass',
  books: ['Walden'],
  highlights: 12,
  clippingsCreated: 10,
  notesCreated: 2,
  attempts: 1,
  receivedAt: '2026-10-12T08:05:00.000Z',
  ...overrides,
})

it('tells a reader what became of each email, in UTC', async () => {
  render(
    await InboundEmailList({
      audience: 'reader',
      emails: [
        email(),
        email({
          id: 2,
          subject: '',
          status: 'failed_authentication',
          books: [],
        }),
      ],
    })
  )

  expect(screen.getByText(en.email.status.imported)).toBeTruthy()
  expect(screen.getByText('Walden')).toBeTruthy()
  expect(screen.getByText('Highlights 12 · New 10 · Notes 2')).toBeTruthy()
  expect(screen.getByText(en.email.history.noSubject)).toBeTruthy()
  expect(
    screen.getByText(en.email.history.hint.failed_authentication)
  ).toBeTruthy()
  expect(screen.getAllByText(/^Oct 12, 2026, 8:05\sAM UTC$/)).toHaveLength(2)
  // DMARC and attempts are for administrators.
  expect(screen.queryByText('DMARC: pass')).toBeNull()
})

it('shows administrators the details behind each email', async () => {
  render(
    await InboundEmailList({
      audience: 'admin',
      emails: [
        email({
          sender: 'stranger@example.com',
          status: 'reply_limited',
          detail: 'sender_day',
          dmarc: null,
          books: [],
        }),
        email({
          id: 2,
          status: 'failed',
          detail: 'Resend receiving: unavailable',
          attempts: 5,
        }),
      ],
    })
  )

  expect(screen.getByText('stranger@example.com')).toBeTruthy()
  expect(screen.getByText(en.admin.inbound.limit.sender_day)).toBeTruthy()
  expect(screen.getByText('Resend receiving: unavailable')).toBeTruthy()
  expect(screen.getByText('DMARC: pass')).toBeTruthy()
  expect(screen.getByText('Attempts: 5')).toBeTruthy()
  expect(screen.queryByText(en.email.history.hint.failed)).toBeNull()
})
