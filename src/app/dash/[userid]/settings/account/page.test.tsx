import { render, screen } from '@testing-library/react'
import { connection } from 'next/server'

import { gateConfig } from '@/server/gate/config'

import Page from './page'

vi.mock('next/server', () => ({ connection: vi.fn() }))
vi.mock('@/server/gate/config', () => ({ gateConfig: vi.fn() }))
vi.mock('./AccountRemoveButton', () => ({ default: () => null }))

test('reads Gate configuration only after the request boundary resolves', async () => {
  let resolveConnection!: () => void
  vi.mocked(connection).mockReturnValue(
    new Promise<void>((resolve) => {
      resolveConnection = resolve
    })
  )
  vi.mocked(gateConfig).mockImplementation(() => {
    throw new Error('configuration was read before a request')
  })

  const page = Page()
  await Promise.resolve()
  expect(gateConfig).not.toHaveBeenCalled()

  vi.mocked(gateConfig).mockReturnValue({
    baseUrl: 'https://runtime-gate.example',
  } as ReturnType<typeof gateConfig>)
  resolveConnection()

  render(await page)
  expect(gateConfig).toHaveBeenCalledOnce()
  expect(
    screen
      .getByRole('link', { name: 'Manage Gate account' })
      .getAttribute('href')
  ).toBe('https://runtime-gate.example/account')
})
