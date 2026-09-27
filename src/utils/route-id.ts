const MAX_INT = 2 ** 31 - 1

/**
 * A record id from a route segment: a positive integer that fits GraphQL's
 * Int, or null for anything else (so the page can 404 instead of erroring).
 */
export function parseRouteId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null
  const id = Number(value)
  return id > 0 && id <= MAX_INT ? id : null
}
