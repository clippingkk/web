// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
const request = vi.hoisted(() => vi.fn())
vi.mock('../../gate/client', () => ({
  gateRequest: request,
  projectPath: () => '/projects/product',
}))
vi.mock('../../gate/config', () => ({
  gateConfig: () => ({
    apiKey: 'key',
    projectId: 'product',
    environmentId: '00000000-0000-4000-8000-000000000001',
  }),
}))
import { userPremiumEndAt } from '../premium-loader'
beforeEach(() => {
  request.mockReset()
})
it('batches 100 subjects, deduplicates repeats, and isolates requests', async () => {
  request.mockImplementation(async (_path, options) =>
    JSON.parse(options.body).subjectIds.map((subjectId: string) => ({
      subjectId,
      premiumEndAt: '2099-01-01',
    }))
  )
  const context = new Request('https://example.com/graphql')
  const subjects = Array.from({ length: 100 }, (_, i) => `subject-${i}`)
  const results = await Promise.all(
    [...subjects, ...subjects].map((id) => userPremiumEndAt(context, id))
  )
  expect(results).toHaveLength(200)
  expect(results.every((value) => value === '2099-01-01')).toBe(true)
  expect(request).toHaveBeenCalledTimes(1)
  await userPremiumEndAt(new Request(context.url), subjects[0])
  expect(request).toHaveBeenCalledTimes(2)
})
it('keeps public display queries available on outages without granting Premium', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  request.mockRejectedValue(new Error('Gate unavailable'))
  const context = new Request('https://example.com/graphql')
  expect(
    await Promise.all(
      ['one', 'two', null].map((id) => userPremiumEndAt(context, id))
    )
  ).toEqual(['', '', ''])
  expect(request).toHaveBeenCalledTimes(1)
})
it('reports an outage instead of hiding it', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {})
  request.mockRejectedValue(new Error('Gate unavailable'))
  await userPremiumEndAt(new Request('https://example.com/graphql'), 'one')
  expect(log).toHaveBeenCalledWith(
    'billing: Premium display state unavailable',
    expect.any(Error)
  )
})
