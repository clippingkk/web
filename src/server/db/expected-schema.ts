import { is } from 'drizzle-orm'
import { getTableConfig, PgTable } from 'drizzle-orm/pg-core'

import * as schema from './schema'

// Derived from schema.ts rather than hand-written. A hand-maintained list is exactly
// what let `users.gate_user_id` reach production unnoticed: the one in
// scripts/db-preflight.mjs covered 10 of 16 tables and neither gate column.
//
// Keep this module free of non-erasable TypeScript and of the `@/` alias, so plain
// `node` can import it from scripts/ via type stripping.
export function expectedTableColumns(): Map<string, string[]> {
  const tables = new Map<string, string[]>()
  for (const value of Object.values(schema)) {
    if (!is(value, PgTable)) continue
    const config = getTableConfig(value)
    tables.set(
      config.name,
      config.columns.map((column) => column.name)
    )
  }
  return tables
}
