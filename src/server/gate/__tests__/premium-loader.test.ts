// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
const request = vi.hoisted(() => vi.fn())
vi.mock('../client', () => ({
  gateRequest: request,
  projectPath: () => '/projects/product',
}))
vi.mock('../config', () => ({
  gateConfig: () => ({ environmentId: 'environment' }),
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
  request.mockRejectedValue(new Error('Gate unavailable'))
  const context = new Request('https://example.com/graphql')
  expect(
    await Promise.all(
      ['one', 'two', null].map((id) => userPremiumEndAt(context, id))
    )
  ).toEqual(['', '', ''])
  expect(request).toHaveBeenCalledTimes(1)
})
