// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'

import { ApiError } from '@/server/errors'

const mocks = vi.hoisted(() => ({
  userId: vi.fn(),
  bindings: vi.fn(),
  history: vi.fn(),
  notes: vi.fn(),
  env: {
    APP_ORIGIN: 'https://example.com',
    corsAllowedOrigins: new Set<string>(),
    INBOUND_EMAIL_ADDRESS: 'kindle@import.example' as string | undefined,
  },
}))
vi.mock('next/server', () => ({ connection: vi.fn() }))
vi.mock('@/server/env', () => ({ getServerEnv: () => mocks.env }))
vi.mock('@/server/auth', () => ({ requireUserId: mocks.userId }))
vi.mock('@/server/email-import/bindings', () => ({
  listEmailBindings: mocks.bindings,
  MAX_EMAIL_BINDINGS: 10,
}))
vi.mock('@/server/email-import/records', () => ({
  listInboundEmails: mocks.history,
}))
vi.mock('@/server/email-import/notes', () => ({
  listReaderNotes: mocks.notes,
}))
import { GET as overview } from '@/app/api/v3/email-import/route'
import { GET as notes } from '@/app/api/v3/reader-notes/route'

const binding = {
  id: 3,
  email: 'reader@icloud.com',
  verified: true,
  lastImportedAt: '2026-10-12T08:01:00.000Z',
  createdAt: '2026-10-01T00:00:00.000Z',
}
const history = {
  total: 1,
  emails: [
    {
      id: 9,
      sender: 'reader@icloud.com',
      subject: 'iPhone Notebook export for 小王子',
      status: 'imported',
      detail: null,
      dmarc: 'pass',
      books: ['小王子'],
      highlights: 12,
      clippingsCreated: 10,
      notesCreated: 2,
      attempts: 1,
      receivedAt: '2026-10-12T08:00:00.000Z',
    },
  ],
}
const request = (path: string) =>
  new Request(`https://example.com${path}`, {
    headers: { authorization: `Bearer ck_ios_${'a'.repeat(43)}` },
  })

beforeEach(() => {
  vi.clearAllMocks()
  mocks.env.INBOUND_EMAIL_ADDRESS = 'kindle@import.example'
  mocks.userId.mockResolvedValue(7)
  mocks.bindings.mockResolvedValue([binding])
  mocks.history.mockResolvedValue(history)
  mocks.notes.mockResolvedValue({ total: 0, notes: [] })
})

it('answers with the import address, the addresses and the history', async () => {
  const response = await overview(request('/api/v3/email-import'))
  expect(response.status).toBe(200)
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(await response.json()).toMatchObject({
    data: {
      address: 'kindle@import.example',
      maxBindings: 10,
      bindings: [binding],
      history,
    },
  })
  expect(mocks.bindings).toHaveBeenCalledWith(7)
  expect(mocks.history).toHaveBeenCalledWith(7)
})

it('says there is no import address while none is configured', async () => {
  mocks.env.INBOUND_EMAIL_ADDRESS = ''
  const response = await overview(request('/api/v3/email-import'))
  expect((await response.json()).data.address).toBeNull()
})

it('lists the reader’s Kindle notes', async () => {
  const note = {
    id: 1,
    title: '小王子',
    pageAt: '#197',
    content: 'A note',
    clippingId: 42,
    createdAt: '2026-10-12T08:00:00.000Z',
  }
  mocks.notes.mockResolvedValue({ total: 1, notes: [note] })
  const response = await notes(request('/api/v3/reader-notes'))
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(await response.json()).toMatchObject({
    data: { total: 1, notes: [note] },
  })
  expect(mocks.notes).toHaveBeenCalledWith(7)
})

it('asks a signed-out caller to sign in', async () => {
  mocks.userId.mockRejectedValue(
    new ApiError('unauthorized', 401, 'UNAUTHORIZED')
  )
  for (const response of [
    await overview(request('/api/v3/email-import')),
    await notes(request('/api/v3/reader-notes')),
  ]) {
    expect(response.status).toBe(401)
    expect(await response.json()).toMatchObject({ code: 'UNAUTHORIZED' })
  }
  expect(mocks.bindings).not.toHaveBeenCalled()
  expect(mocks.notes).not.toHaveBeenCalled()
})
