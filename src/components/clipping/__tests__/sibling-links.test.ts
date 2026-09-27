import { describe, expect, it } from 'vitest'

import { IN_APP_CHANNEL } from '@/services/channel'

import { getSiblingLinks, parseChannel } from '../sibling-links'

const prev = { userClippingID: 10, bookClippingID: 20 }
const next = { userClippingID: 11, bookClippingID: 21 }

describe('getSiblingLinks', () => {
  it('stays inside the book when the reader came from a book', () => {
    expect(
      getSiblingLinks(IN_APP_CHANNEL.clippingFromBook, 'annatar', prev, next)
    ).toEqual({
      prev: '/dash/annatar/clippings/20?iac=1',
      next: '/dash/annatar/clippings/21?iac=1',
    })
  })

  it("follows the reader's list otherwise", () => {
    expect(
      getSiblingLinks(IN_APP_CHANNEL.clippingFromUser, 42, prev, next)
    ).toEqual({
      prev: '/dash/42/clippings/10?iac=0',
      next: '/dash/42/clippings/11?iac=0',
    })
  })

  it('omits missing or zero siblings', () => {
    expect(
      getSiblingLinks(
        IN_APP_CHANNEL.clippingFromBook,
        'annatar',
        { bookClippingID: 0 },
        {}
      )
    ).toEqual({ prev: null, next: null })
  })
})

describe('parseChannel', () => {
  it('maps the query string to a channel', () => {
    expect(parseChannel('1')).toBe(IN_APP_CHANNEL.clippingFromBook)
    expect(parseChannel('0')).toBe(IN_APP_CHANNEL.clippingFromUser)
    expect(parseChannel('nope')).toBe(IN_APP_CHANNEL.clippingFromUser)
    expect(parseChannel(undefined)).toBe(IN_APP_CHANNEL.clippingFromUser)
  })
})
