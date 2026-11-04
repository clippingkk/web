import { readFile, readdir } from 'node:fs/promises'

import type { PGlite } from '@electric-sql/pglite'

/**
 * PGlite cannot load PGroonga, the full-text search extension production's
 * PostgreSQL carries (docs/database.md). This stand-in gives its `&@~` operator
 * the meaning the app relies on for plain queries: every whitespace-separated
 * term is a case-insensitive substring of one of the values, and a blank query
 * matches nothing. It models neither `OR`, `-term`, phrases nor PGroonga's width
 * normalisation; pgroonga.test.ts checks those against the real extension.
 */
const PGROONGA_STAND_IN = String.raw`
CREATE FUNCTION pgroonga_condition(query text, index_name text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$ SELECT query $$;
CREATE FUNCTION pgroonga_stand_in_match(target text[], query text)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT coalesce(bool_and(EXISTS (
           SELECT 1 FROM unnest(target) AS value
            WHERE strpos(lower(value), lower(term)) > 0)), false)
    FROM regexp_split_to_table(btrim(query), '\s+') AS term
   WHERE term <> ''
$$;
CREATE OPERATOR &@~ (
  LEFTARG = text[], RIGHTARG = text, FUNCTION = pgroonga_stand_in_match
);
`

/** Statements PGlite cannot run: creating the extension and its indexes. */
const NEEDS_PGROONGA = /create extension[^;]*\bpgroonga\b|using pgroonga\b/i

/**
 * Builds the schema from drizzle/*.sql in order, as `pnpm db:migrate` does,
 * except for the PGroonga statements, whose operator the stand-in provides.
 */
export async function migratePglite(pg: PGlite) {
  await pg.exec(PGROONGA_STAND_IN)
  const names = (await readdir('drizzle'))
    .filter((name) => name.endsWith('.sql'))
    .sort()
  for (const name of names) {
    const sql = await readFile(`drizzle/${name}`, 'utf8')
    for (const statement of sql.split('--> statement-breakpoint'))
      if (!NEEDS_PGROONGA.test(statement)) await pg.exec(statement)
  }
}
