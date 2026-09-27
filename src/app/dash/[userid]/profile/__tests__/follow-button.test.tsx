import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import FollowButton from '../follow-button'

const mocks = vi.hoisted(() => ({
  follow: vi.fn(),
  unfollow: vi.fn(),
  refresh: vi.fn(),
  push: vi.fn(),
}))

vi.mock('@apollo/client/react', () => ({
  useMutation: (doc: { definitions: { name?: { value: string } }[] }) => [
    doc.definitions[0]?.name?.value?.toLowerCase().startsWith('unfollow')
      ? mocks.unfollow
      : mocks.follow,
    { loading: false },
  ],
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mocks.refresh, push: mocks.push }),
  usePathname: () => '/dash/ada/profile',
}))

vi.mock('@/i18n/client', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

function button() {
  return screen.getByRole('button')
}

describe('FollowButton', () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset()
    mocks.follow.mockResolvedValue({})
    mocks.unfollow.mockResolvedValue({})
  })

  it('follows optimistically and refreshes', async () => {
    render(<FollowButton userId={7} isFan={false} signedIn />)

    await act(async () => fireEvent.click(button()))

    expect(mocks.follow).toHaveBeenCalledWith({
      variables: { targetUserID: 7 },
    })
    expect(button().textContent).toContain('following')
    expect(mocks.refresh).toHaveBeenCalled()
  })

  it('rolls back when the request fails', async () => {
    mocks.follow.mockRejectedValue(new Error('offline'))
    render(<FollowButton userId={7} isFan={false} signedIn />)

    await act(async () => fireEvent.click(button()))

    expect(button().textContent).toBe('follow')
  })

  it('shows the new profile’s state after navigating between profiles', () => {
    const { rerender } = render(<FollowButton userId={7} isFan signedIn />)
    expect(button().textContent).toContain('following')

    rerender(<FollowButton userId={8} isFan={false} signedIn />)

    expect(button().textContent).toBe('follow')
  })

  it('sends signed-out visitors to sign in', async () => {
    render(<FollowButton userId={7} isFan={false} signedIn={false} />)

    await act(async () => fireEvent.click(button()))

    expect(mocks.push).toHaveBeenCalledTimes(1)
    expect(mocks.follow).not.toHaveBeenCalled()
  })
})
