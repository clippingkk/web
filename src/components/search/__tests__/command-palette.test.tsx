import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import CommandPalette from '../command-palette'

type Clipping = {
  id: number
  content: string
  title: string
  creator: { id: number; name: string; domain?: string | null }
}

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  search: vi.fn(),
  data: undefined as
    | {
        mine: { clippings: Clipping[] } | null
        community: { clippings: Clipping[]; users: [] }
      }
    | undefined,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}))

vi.mock('@apollo/client/react', () => ({
  useLazyQuery: () => [mocks.search, { data: mocks.data, loading: false }],
}))

vi.mock('@/i18n/client', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

const viewer = { id: 42, slug: 'reader' }
const author = { id: 7, name: 'Ada', domain: 'ada-reads' }

function clipping(id: number, content: string): Clipping {
  return { id, content, title: 'Dune', creator: author }
}

function palette() {
  return <CommandPalette open onClose={() => {}} viewer={viewer} />
}

function input() {
  return screen.getByRole('combobox')
}

function press(key: string) {
  fireEvent.keyDown(input(), { key })
}

describe('CommandPalette', () => {
  beforeEach(() => {
    mocks.push.mockReset()
    mocks.search.mockReset()
    mocks.data = undefined
    localStorage.clear()
  })

  afterEach(() => vi.useRealTimers())

  it('moves through the pages with the arrow keys and opens one on Enter', () => {
    render(palette())

    press('ArrowDown')
    press('ArrowDown')
    press('ArrowUp')
    press('Enter')

    expect(mocks.push).toHaveBeenCalledWith('/dash/reader/square')
  })

  it('searches once the query settles', () => {
    vi.useFakeTimers()
    render(palette())

    fireEvent.change(input(), { target: { value: 'dune' } })
    expect(mocks.search).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(250))

    expect(mocks.search).toHaveBeenCalledWith({
      variables: { query: 'dune', withMine: true },
    })
  })

  it('keeps the highlighted result when more results land above it', () => {
    mocks.data = {
      mine: null,
      community: {
        clippings: [clipping(1, 'first'), clipping(2, 'second')],
        users: [],
      },
    }
    const { rerender } = render(palette())
    fireEvent.change(input(), { target: { value: 'dune' } })
    press('ArrowDown')

    // the viewer's own matches arrive and are listed first
    mocks.data = { ...mocks.data, mine: { clippings: [clipping(9, 'mine')] } }
    rerender(palette())
    press('Enter')

    expect(mocks.push).toHaveBeenCalledWith('/dash/ada-reads/clippings/2')
  })

  it('falls back to the first result when the highlighted one disappears', () => {
    mocks.data = {
      mine: null,
      community: {
        clippings: [clipping(1, 'first'), clipping(2, 'second')],
        users: [],
      },
    }
    const { rerender } = render(palette())
    fireEvent.change(input(), { target: { value: 'dune' } })
    press('ArrowDown')

    mocks.data = {
      mine: null,
      community: { clippings: [clipping(1, 'first')], users: [] },
    }
    rerender(palette())
    press('Enter')

    expect(mocks.push).toHaveBeenCalledWith('/dash/ada-reads/clippings/1')
  })
})
