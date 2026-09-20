import { expectedTableColumns } from './expected-schema'

export type SchemaCheckResult =
  | { status: 'ok' }
  | { status: 'drift'; missing: string[] }
  | { status: 'unknown'; reason: string }

type SchemaRow = { table_name: string; column_name: string }

export type SchemaQuery = (
  text: string,
  params: string[][]
) => Promise<{ rows: SchemaRow[] }>

const COLUMNS_QUERY = `select table_name, column_name
     from information_schema.columns
    where table_schema = 'public'
      and table_name = any($1::text[])`

// Next binds the port before register() resolves, so a check that hangs would leave a
// listening container that is never ready. Bound it.
const DEFAULT_TIMEOUT_MS = 10_000

async function withDeadline<T>(
  work: Promise<T>,
  timeoutMs: number
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(new Error(`schema check timed out after ${timeoutMs}ms`)),
          timeoutMs
        )
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/**
 * Compares the live database against the tables and columns schema.ts declares.
 *
 * Existence only -- never types, nullability, defaults or index names. The production
 * database was adopted from the Go/Ent baseline, so that kind of drift is expected and
 * asserting it would turn this safety net into an outage generator.
 */
export async function checkDatabaseSchema(
  query: SchemaQuery,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<SchemaCheckResult> {
  const expected = expectedTableColumns()

  let rows: SchemaRow[]
  try {
    const result = await withDeadline(
      query(COLUMNS_QUERY, [[...expected.keys()]]),
      timeoutMs
    )
    rows = result.rows
  } catch (error) {
    return {
      status: 'unknown',
      reason: error instanceof Error ? error.message : String(error),
    }
  }

  const actual = new Map<string, Set<string>>()
  for (const row of rows) {
    const columns = actual.get(row.table_name) ?? new Set<string>()
    columns.add(row.column_name)
    actual.set(row.table_name, columns)
  }

  const missing: string[] = []
  for (const [table, columns] of expected) {
    const present = actual.get(table)
    // An absent table would otherwise report every one of its columns.
    if (!present) {
      missing.push(`${table} (table missing)`)
      continue
    }
    for (const column of columns)
      if (!present.has(column)) missing.push(`${table}.${column}`)
  }

  return missing.length ? { status: 'drift', missing } : { status: 'ok' }
}

const globalForSchema = globalThis as typeof globalThis & {
  clippingkkSchemaStatus?: SchemaCheckResult
}

export function recordSchemaStatus(result: SchemaCheckResult) {
  globalForSchema.clippingkkSchemaStatus = result
}

export function getSchemaStatus(): SchemaCheckResult | undefined {
  return globalForSchema.clippingkkSchemaStatus
}
