import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, cleanup, render, screen } from '@testing-library/react'
import type { Route } from 'next'
import React from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import PaymentSuccessContent, { MAX_ATTEMPTS } from './content'

const mocks = vi.hoisted(() => ({ orderInfo: vi.fn() }))
vi.mock('@/services/payment', () => ({ getPaymentOrderInfo: mocks.orderInfo }))
vi.mock('@/i18n/client', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: {} }),
}))
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
  }: {
    href: string
    children: React.ReactNode
  }) => <a href={href}>{children}</a>,
}))
vi.mock('@annatarhe/lake-ui/button', () => ({
  default: ({
    render,
    children,
  }: {
    render?: React.ReactElement<{ children?: React.ReactNode }>
    children: React.ReactNode
  }) => (render ? React.cloneElement(render, undefined, children) : children),
}))
vi.mock('@annatarhe/lake-ui/empty-state', () => ({
  default: (props: { title: string; action?: React.ReactNode }) => (
    <section>
      <h1>{props.title}</h1>
      {props.action}
    </section>
  ),
}))
vi.mock('@annatarhe/lake-ui/spinner', () => ({ default: () => null }))

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: false })
  mocks.orderInfo.mockReset()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function renderContent() {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <PaymentSuccessContent
        sessionId="cs_test"
        libraryHref={'/dash/annatar/home' as Route}
        subscriptionHref={'/dash/annatar/settings/orders' as Route}
      />
    </QueryClientProvider>
  )
}

async function tick(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

it('celebrates once Premium is active and links onwards', async () => {
  mocks.orderInfo
    .mockResolvedValueOnce({ premiumActive: false })
    .mockResolvedValue({ premiumActive: true })
  renderContent()
  await tick(0)
  expect(screen.getByText('success.confirming.title')).toBeTruthy()

  await tick(3000)
  expect(screen.getByText('success.active.title')).toBeTruthy()
  expect(
    screen.getByText('success.subscription').closest('a')?.getAttribute('href')
  ).toBe('/dash/annatar/settings/orders')

  await tick(9000)
  expect(mocks.orderInfo).toHaveBeenCalledTimes(2)
})

it('stops after the attempt limit, failures included, and says so', async () => {
  mocks.orderInfo.mockImplementation(async () => {
    if (mocks.orderInfo.mock.calls.length % 2) throw new Error('not yet')
    return { premiumActive: false }
  })
  renderContent()
  await tick(0)
  for (let i = 0; i < MAX_ATTEMPTS + 5; i++) await tick(3000)

  expect(mocks.orderInfo).toHaveBeenCalledTimes(MAX_ATTEMPTS)
  expect(screen.getByText('success.pending.title')).toBeTruthy()
  expect(
    screen.getByText('success.library').closest('a')?.getAttribute('href')
  ).toBe('/dash/annatar/home')
})
