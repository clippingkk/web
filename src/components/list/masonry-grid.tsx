'use client'

import type React from 'react'
import { useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'

type Columns = { base: number; md?: number; lg?: number; xl?: number }

const QUERIES = {
  md: '(width >= 48rem)',
  lg: '(width >= 64rem)',
  xl: '(width >= 80rem)',
} as const

function columnCount(columns: Columns): number {
  if (typeof window === 'undefined' || !window.matchMedia) return columns.base
  if (columns.xl && window.matchMedia(QUERIES.xl).matches) return columns.xl
  if (columns.lg && window.matchMedia(QUERIES.lg).matches) return columns.lg
  if (columns.md && window.matchMedia(QUERIES.md).matches) return columns.md
  return columns.base
}

function subscribe(onChange: () => void) {
  const lists = Object.values(QUERIES).map((q) => window.matchMedia(q))
  for (const list of lists) list.addEventListener('change', onChange)
  return () => {
    for (const list of lists) list.removeEventListener('change', onChange)
  }
}

/**
 * Greedy shortest-column placement in input order. Because every item's
 * column depends only on the items before it, appending a page never moves
 * anything already on screen.
 */
export function distribute<T>(
  items: readonly T[],
  count: number,
  estimate: (item: T) => number
): T[][] {
  const columns: T[][] = Array.from({ length: Math.max(1, count) }, () => [])
  const heights = columns.map(() => 0)
  for (const item of items) {
    let target = 0
    for (let i = 1; i < heights.length; i++) {
      if (heights[i] < heights[target]) target = i
    }
    columns[target].push(item)
    heights[target] += estimate(item)
  }
  return columns
}

type MasonryGridProps<T> = {
  items: readonly T[]
  getKey: (item: T) => React.Key
  renderItem: (item: T) => React.ReactNode
  /** Relative height guess used to balance columns (e.g. text length). */
  estimateHeight: (item: T) => number
  columns?: Columns
  className?: string
}

function MasonryGrid<T>(props: MasonryGridProps<T>) {
  const {
    items,
    getKey,
    renderItem,
    estimateHeight,
    columns = { base: 1, md: 2, xl: 3 },
    className,
  } = props
  // The server renders a single column; the client widens after hydration.
  const count = useSyncExternalStore(
    subscribe,
    () => columnCount(columns),
    () => 1
  )
  const lanes = distribute(items, count, estimateHeight)

  return (
    <div
      className={cn('grid items-start gap-4 md:gap-5', className)}
      style={{ gridTemplateColumns: `repeat(${lanes.length}, minmax(0, 1fr))` }}
    >
      {lanes.map((lane, index) => (
        <div key={index} className="flex min-w-0 flex-col gap-4 md:gap-5">
          {lane.map((item) => (
            <div key={getKey(item)}>{renderItem(item)}</div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default MasonryGrid
