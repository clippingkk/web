import { sql } from 'drizzle-orm'

import { clippings, users } from './schema'

/**
 * Full-text search through PGroonga, which production's PostgreSQL
 * (ghcr.io/rawback-app/db) carries; see docs/database.md.
 *
 * `query` is Groonga query syntax: whitespace means AND, `OR` means OR, a leading
 * `-` excludes a term and double quotes mark a phrase. Each term matches as a case-
 * and width-insensitive substring in any script, CJK included, and terms may match
 * different columns. Malformed syntax never raises, and a blank query matches
 * nothing.
 *
 * `pgroonga_condition(..., index_name)` keeps that meaning in every plan. Without
 * it, a row Postgres checks outside the index (a sequential scan, or a filter after
 * another index) is tokenized with PGroonga's defaults, which match Latin text by
 * whole words only.
 *
 * Each expression must stay identical to its index's in schema.ts, or Postgres
 * scans the whole table instead.
 */
export const clippingMatches = (query: string) =>
  sql`array[${clippings.title}::text, ${clippings.content}] &@~ pgroonga_condition(${query}, index_name => 'clippings_search_pgroonga')`

export const userMatches = (query: string) =>
  sql`array[${users.name}::text, ${users.domain}::text] &@~ pgroonga_condition(${query}, index_name => 'users_search_pgroonga')`
