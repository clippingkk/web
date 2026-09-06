import { cleanup, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { ApiError } from '@/server/errors'

const mocks = vi.hoisted(() => ({ session: vi.fn(), redirect: vi.fn() }))
vi.mock('@/server/gate/current', () => ({ currentSession: mocks.session }))
vi.mock('@/server/gate/config', () => ({
  gateConfig: () => ({ baseUrl: 'https://gate.example' }),
}))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))

import AuthContent from './AuthContent'
import AuthPage from './page'

beforeEach(() => {
  mocks.session.mockReset().mockResolvedValue(null)
  mocks.redirect.mockReset().mockImplementation(() => {
    throw new Error('NEXT_REDIRECT')
  })
})
afterEach(cleanup)

it('renders the welcome shell and accessible fallback while request data is pending', () => {
  const html = renderToString(<AuthPage searchParams={new Promise(() => {})} />)
  expect(html).toContain('Your best reading moments,')
  expect(html).toContain('Loading sign-in options…')
  expect(html).toContain('<output')
  expect(mocks.session).not.toHaveBeenCalled()
})

it('renders signed-out actions and preserves encoded next forwarding', async () => {
  const next = '/dash/42/home?filter=books&sort=newest'
  render(await AuthContent({ searchParams: Promise.resolve({ next }) }))
  expect(
    screen
      .getByRole('link', { name: 'Continue with Gate' })
      .getAttribute('href')
  ).toBe(`/api/auth/login?next=${encodeURIComponent(next)}`)
  expect(
    screen
      .getByRole('link', { name: 'Manage your Gate account' })
      .getAttribute('href')
  ).toBe('https://gate.example/account')
  expect(
    screen.getByRole('link', { name: 'Contact support' }).getAttribute('href')
  ).toBe('mailto:iamhele1994@gmail.com')
  expect(screen.queryByRole('alert')).toBeNull()
})

it('uses the login endpoint without a query when next is absent', async () => {
  render(await AuthContent({ searchParams: Promise.resolve({}) }))
  expect(
    screen
      .getByRole('link', { name: 'Continue with Gate' })
      .getAttribute('href')
  ).toBe('/api/auth/login')
})

it('redirects authenticated users to their dashboard', async () => {
  mocks.session.mockResolvedValue({ localUserId: 42 })
  await expect(
    AuthContent({ searchParams: Promise.resolve({}) })
  ).rejects.toThrow('NEXT_REDIRECT')
  expect(mocks.redirect).toHaveBeenCalledWith('/dash/42/home')
})

it.each([
  ['EMAIL_VERIFICATION_REQUIRED', 'Verify your email in Gate, then try again.'],
  [
    'FORBIDDEN',
    'Your ClippingKK access has been removed. Contact support to restore access.',
  ],
  [
    'ACCOUNT_RECOVERY_REQUIRED',
    'We could not safely link your existing account. Contact support to recover your clippings.',
  ],
  ['UNKNOWN', 'Sign-in could not be completed. Please try again.'],
])('shows %s even with a valid session', async (error, message) => {
  mocks.session.mockResolvedValue({ localUserId: 42 })
  render(await AuthContent({ searchParams: Promise.resolve({ error }) }))
  expect(screen.getByRole('alert').textContent).toBe(message)
  expect(mocks.redirect).not.toHaveBeenCalled()
})

it.each([401, 403])(
  'turns a %s session error into a recoverable alert',
  async (status) => {
    mocks.session.mockRejectedValue(new ApiError('denied', status, 'FORBIDDEN'))
    const params = Object.freeze({})
    render(await AuthContent({ searchParams: Promise.resolve(params) }))
    expect(screen.getByRole('alert').textContent).toContain(
      'access has been removed'
    )
  }
)

it('preserves the query error over the session error', async () => {
  mocks.session.mockRejectedValue(new ApiError('denied', 403, 'FORBIDDEN'))
  render(
    await AuthContent({
      searchParams: Promise.resolve({ error: 'EMAIL_VERIFICATION_REQUIRED' }),
    })
  )
  expect(screen.getByRole('alert').textContent).toContain('Verify your email')
})

it.each([new Error('offline'), new ApiError('unavailable', 503)])(
  'propagates unexpected session failures',
  async (error) => {
    mocks.session.mockRejectedValue(error)
    await expect(
      AuthContent({ searchParams: Promise.resolve({}) })
    ).rejects.toBe(error)
  }
)
