import type { Route } from 'next'

import { IN_APP_CHANNEL } from '@/services/channel'
import { clippingHref, type SlugSource } from '@/utils/profile.utils'

type SiblingIds = {
  userClippingID?: number | null
  bookClippingID?: number | null
}

/** Reads `?iac=` into a channel; anything unknown means "this reader's list". */
export function parseChannel(value?: string | null): IN_APP_CHANNEL {
  return Number(value) === IN_APP_CHANNEL.clippingFromBook
    ? IN_APP_CHANNEL.clippingFromBook
    : IN_APP_CHANNEL.clippingFromUser
}

function idFor(ids: SiblingIds, channel: IN_APP_CHANNEL) {
  switch (channel) {
    case IN_APP_CHANNEL.clippingFromBook:
      return ids.bookClippingID
    case IN_APP_CHANNEL.clippingFromUser:
      return ids.userClippingID
  }
}

/**
 * Previous/next links that stay in the channel the reader came from: the
 * same book, or the same reader's list. Both are the creator's clippings.
 */
export function getSiblingLinks(
  channel: IN_APP_CHANNEL,
  creator: SlugSource,
  prev: SiblingIds,
  next: SiblingIds
): { prev: Route | null; next: Route | null } {
  const link = (ids: SiblingIds) => {
    const id = idFor(ids, channel)
    return id && id > 0 ? clippingHref(creator, id, channel) : null
  }
  return { prev: link(prev), next: link(next) }
}
