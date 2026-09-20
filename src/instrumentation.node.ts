export async function registerNodeRuntime() {
  const { getServerEnv } = await import('./server/env')
  const env = (() => {
    try {
      return getServerEnv()
    } catch (error) {
      console.error('Invalid server environment', error)
      process.exit(1)
    }
  })()

  // Schema drift used to surface as a per-request 42703 buried in a GraphQL
  // "Unexpected error". Stop here instead, naming what is missing.
  if (env.DB_SCHEMA_CHECK === '1' && env.NODE_ENV !== 'test') {
    const { getDatabase } = await import('./server/db')
    const { checkDatabaseSchema, recordSchemaStatus } =
      await import('./server/db/schema-check')
    const { pool } = getDatabase()
    const result = await checkDatabaseSchema((text, params) =>
      pool.query(text, params)
    )
    recordSchemaStatus(result)
    if (result.status === 'drift') {
      // process.exit truncates the OTel batch log processor, so the payload has to
      // ride on console.error to reach the container log.
      console.error(
        `Database schema is missing required columns: ${result.missing.join(', ')}. ` +
          'Run `pnpm db:migrate`, or set DB_SCHEMA_CHECK=0 to boot anyway.'
      )
      process.exit(1)
    }
    // A connection failure is transient; crash-looping the web tier over it would be
    // worse than serving static pages while /probe reports 503.
    if (result.status === 'unknown')
      console.error('Could not verify database schema:', result.reason)
  }

  const { startWorker } = await import('./server/jobs/worker')
  startWorker()
}
