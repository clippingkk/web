import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, expect, it, vi } from 'vitest'

import ErrorState from './error-state'

vi.mock('@/i18n/client', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'en' },
  }),
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

afterEach(cleanup)

const reset = () => undefined

it('hides the minified React placeholder and shows the digest instead', () => {
  const error = Object.assign(
    new Error(
      'Minified React error #441; visit https://react.dev/errors/441 for the full message'
    ),
    { digest: '94729081' }
  )

  render(<ErrorState error={error} reset={reset} />)

  expect(screen.queryByText(/Minified React error/)).toBeNull()
  expect(screen.getByText('error.generic')).toBeTruthy()
  expect(screen.getByText('94729081')).toBeTruthy()
})

it('shows a message that was written for the reader', () => {
  render(<ErrorState error={new Error('user not found')} reset={reset} />)

  expect(screen.getByText('user not found')).toBeTruthy()
})

it('offers a sign-in link only when the session is what failed', () => {
  const { unmount } = render(
    <ErrorState error={new Error('Sign in again')} reset={reset} />
  )
  expect(screen.getByText('error.signIn')).toBeTruthy()
  unmount()

  render(<ErrorState error={new Error('book not found')} reset={reset} />)
  expect(screen.queryByText('error.signIn')).toBeNull()
})
