export async function registerNodeRuntime() {
  const { getServerEnv } = await import('./server/env')
  let env
  try {
    env = getServerEnv()
  } catch (error) {
    console.error('Invalid server environment', error)
    process.exit(1)
  }
  if (!env.runWorker) return

  const { startWorker } = await import('./server/jobs/worker')
  startWorker()
}
