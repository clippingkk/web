// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
const state = vi.hoisted(() => ({
  subject: 'gate-person' as string | null,
  request: vi.fn(),
  environmentId: '00000000-0000-4000-8000-000000000001',
}))
vi.mock('../../gate/authz', () => ({
  subjectForUser: async () => state.subject,
  requireSubject: async () => state.subject,
}))
vi.mock('../../gate/client', () => ({
  gateRequest: state.request,
  projectPath: () => '/projects/product',
}))
vi.mock('../../gate/config', () => ({
  gateConfig: () => ({
    apiKey: 'key',
    projectId: 'product',
    environmentId: state.environmentId,
  }),
}))
import { ApiError } from '../../errors'
import { isPremium, premiumEndAt } from '../premium'

beforeEach(() => {
  state.subject = 'gate-person'
  state.environmentId = '00000000-0000-4000-8000-000000000001'
  state.request.mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
const answer = (premiumEndAt: string | null) =>
  state.request.mockResolvedValue([{ subjectId: 'gate-person', premiumEndAt }])

it('reads the same Gate state that badges show', async () => {
  answer('2099-01-01T00:00:00.000Z')
  expect(await isPremium(7)).toBe(true)
  const [path, init] = state.request.mock.calls[0]
  expect(path).toBe('/projects/product/billing/subjects/state')
  expect(JSON.parse(init.body)).toEqual({
    environmentId: state.environmentId,
    subjectIds: ['gate-person'],
  })
})

it('is Free when Premium ended or never started', async () => {
  answer('2000-01-01T00:00:00.000Z')
  expect(await isPremium(7)).toBe(false)
  answer(null)
  expect(await premiumEndAt(7)).toBeNull()
})

it('is Free without asking Gate when the account is not linked', async () => {
  state.subject = null
  expect(await isPremium(7)).toBe(false)
  expect(state.request).not.toHaveBeenCalled()
})

it('fails loudly instead of reporting Free during an outage', async () => {
  state.request.mockRejectedValue(new ApiError('down', 503, 'GATE_UNAVAILABLE'))
  await expect(isPremium(7)).rejects.toMatchObject({ status: 503 })
})

it('refuses to query Gate with a missing environment id', async () => {
  state.environmentId = ''
  await expect(isPremium(7)).rejects.toMatchObject({
    status: 503,
    code: 'GATE_NOT_CONFIGURED',
  })
  expect(state.request).not.toHaveBeenCalled()
})
