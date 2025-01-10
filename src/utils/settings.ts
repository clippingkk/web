import type { CacheSizes } from '@apollo/client/utilities'

; (globalThis as any)[Symbol.for('apollo.cacheSize')] = {
  parser: 100,
  print: 100,
  'fragmentRegistry.lookup': 500
} satisfies Partial<CacheSizes>
