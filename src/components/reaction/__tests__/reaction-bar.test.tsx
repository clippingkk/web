import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ReactionBar from '../reaction-bar'

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  remove: vi.fn(),
  refresh: vi.fn(),
  push: vi.fn(),
}))

vi.mock('@apollo/client/react', () => ({
  useMutation: (doc: { definitions: { name?: { value: string } }[] }) => [
    doc.definitions[0]?.name?.value === 'reactionRemove'
      ? mocks.remove
      : mocks.create,
  ],
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mocks.refresh, push: mocks.push }),
  usePathname: () => '/dash/reader/clippings/7',
}))

vi.mock('@/i18n/client', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

const viewer = { id: 42, name: 'Reader' }

function thumbsUp(reactionId?: number) {
  return [
    {
      symbol: '👍',
      count: 1,
      done: true,
      recently: [
        {
          id: reactionId ?? 0,
          symbol: '👍',
          creator: { id: viewer.id, avatar: '', name: viewer.name },
          createdAt: '2026-09-27T00:00:00Z',
        },
      ],
    },
  ]
}

function thumbsUpButton() {
  return screen.getByText('👍').closest('button') as HTMLButtonElement
}

describe('ReactionBar', () => {
  beforeEach(() => {
    for (const fn of Object.values(mocks)) fn.mockReset()
    mocks.create.mockResolvedValue({ data: { createReaction: true } })
    mocks.remove.mockResolvedValue({ data: { removeReaction: true } })
  })

  it('can undo a reaction it just created once the refresh brings its id', async () => {
    const { rerender } = render(
      <ReactionBar clippingId={7} viewerId={viewer.id} symbolCounts={[]} />
    )

    await act(async () => fireEvent.click(thumbsUpButton()))
    expect(mocks.create).toHaveBeenCalledTimes(1)
    expect(mocks.refresh).toHaveBeenCalledTimes(1)
    expect(thumbsUpButton().getAttribute('aria-pressed')).toBe('true')
    // no id yet, so there is nothing to remove
    expect(thumbsUpButton().disabled).toBe(true)

    // router.refresh() delivers fresh server props carrying the new id
    rerender(
      <ReactionBar
        clippingId={7}
        viewerId={viewer.id}
        symbolCounts={thumbsUp(900)}
      />
    )
    expect(thumbsUpButton().disabled).toBe(false)

    await act(async () => fireEvent.click(thumbsUpButton()))
    expect(mocks.remove).toHaveBeenCalledWith({
      variables: { rid: 900, symbol: '👍' },
    })
    expect(thumbsUpButton().getAttribute('aria-pressed')).toBe('false')
  })

  it('removes without refreshing the whole route', async () => {
    render(
      <ReactionBar
        clippingId={7}
        viewerId={viewer.id}
        symbolCounts={thumbsUp(900)}
      />
    )

    await act(async () => fireEvent.click(thumbsUpButton()))

    expect(mocks.remove).toHaveBeenCalledTimes(1)
    expect(mocks.refresh).not.toHaveBeenCalled()
  })

  it('rolls back when the mutation fails', async () => {
    mocks.create.mockRejectedValue(new Error('offline'))
    render(
      <ReactionBar clippingId={7} viewerId={viewer.id} symbolCounts={[]} />
    )

    await act(async () => fireEvent.click(thumbsUpButton()))

    expect(thumbsUpButton().getAttribute('aria-pressed')).toBe('false')
    expect(mocks.refresh).not.toHaveBeenCalled()
  })

  it('sends signed-out readers to sign in', async () => {
    render(<ReactionBar clippingId={7} symbolCounts={[]} />)

    await act(async () => fireEvent.click(thumbsUpButton()))

    expect(mocks.push).toHaveBeenCalledTimes(1)
    expect(mocks.create).not.toHaveBeenCalled()
  })
})
