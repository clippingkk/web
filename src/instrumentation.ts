export async function register() {
  if (
    process.env.NEXT_RUNTIME !== 'nodejs' ||
    process.env.RUN_WORKER !== 'true'
  )
    return
  const { startWorker } = await import('./server/jobs/worker')
  startWorker()
}
