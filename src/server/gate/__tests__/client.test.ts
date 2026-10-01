// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
const config = vi.hoisted(() => ({
  baseUrl: 'https://gate.test',
  apiKey: 'gate_sk_test',
  projectId: 'product',
}))
vi.mock('../config', () => ({ gateConfig: () => config }))
import { gateRequest } from '../client'

const fetchMock = vi.fn<typeof fetch>()
beforeEach(() => {
  config.apiKey = 'gate_sk_test'
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})
const problem = (status: number) =>
  Response.json(
    {
      type: 'about:blank',
      title: 'Service account is scoped to another environment',
      requestId: 'req_1',
    },
    { status }
  )

it('unwraps the data envelope and sends the service key', async () => {
  fetchMock.mockResolvedValue(Response.json({ data: { ok: true } }))
  await expect(gateRequest('/health')).resolves.toEqual({ ok: true })
  const [url, init] = fetchMock.mock.calls[0]
  expect(url).toBe('https://gate.test/api/v1/health')
  expect(new Headers(init?.headers).get('X-API-Key')).toBe('gate_sk_test')
})

it.each([401, 403, 408, 429, 500, 502])(
  'reports Gate %i as a retryable outage, never as the caller signing out',
  async (status) => {
    fetchMock.mockResolvedValue(problem(status))
    await expect(
      gateRequest('/projects/p/billing/plans')
    ).rejects.toMatchObject({
      status: 503,
      code: 'GATE_UNAVAILABLE',
    })
  }
)

it('logs Gate problem details so a misconfiguration is visible', async () => {
  fetchMock.mockResolvedValue(problem(403))
  await gateRequest('/projects/p/billing/plans', { method: 'POST' }).catch(
    () => {}
  )
  expect(console.error).toHaveBeenCalledWith(
    'gate: POST /projects/p/billing/plans -> 403',
    expect.objectContaining({
      title: 'Service account is scoped to another environment',
      requestId: 'req_1',
    })
  )
})

it('passes other client errors through', async () => {
  fetchMock.mockResolvedValue(problem(409))
  await expect(gateRequest('/x')).rejects.toMatchObject({ status: 409 })
})

it('maps network failures and timeouts to 503', async () => {
  fetchMock.mockRejectedValue(new DOMException('timed out', 'TimeoutError'))
  await expect(gateRequest('/x')).rejects.toMatchObject({ status: 503 })
})

it('refuses to call Gate without a service key', async () => {
  config.apiKey = ''
  await expect(gateRequest('/x')).rejects.toMatchObject({
    status: 503,
    code: 'GATE_NOT_CONFIGURED',
  })
  expect(fetchMock).not.toHaveBeenCalled()
})
