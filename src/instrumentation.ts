export async function register() {
  console.log('hhhhhhh')
  if (process.env.NODE_ENV !== 'production') {
    return
  }
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.OTEL_ENABLED === '1') {
    await import('./node/otel')
  }
  if (process.env.DEBUG === '1') {
    await import('./node/profiler')
  }
}
