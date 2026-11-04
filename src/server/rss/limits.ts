/**
 * How many public highlights the Atom feed includes.
 * Free and Premium both get a feed; Premium's is longer.
 * `src/app/api/rss/user/[uid]/clippings/route.ts` is the enforcement.
 */
export const RSS_FEED_LIMIT = { free: 30, premium: 100 } as const
