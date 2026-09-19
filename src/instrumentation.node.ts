export async function registerNodeRuntime() {
  const { getServerEnv } = await import('./server/env')
  try {
    getServerEnv()
  } catch (error) {
    console.error('Invalid server environment', error)
    process.exit(1)
  }

  const { startWorker } = await import('./server/jobs/worker')
  startWorker()
}
