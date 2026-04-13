export function uniqueById<T extends { id: number | string }>(arr: T[]): T[] {
  const seen = new Set<T['id']>()
  return arr.filter((item) => {
    if (seen.has(item.id)) {
      return false
    }
    seen.add(item.id)
    return true
  })
}
