import { Session } from 'node:inspector/promises'
import fs from 'node:fs'

async function dumpHeapSnapshot() {
  const session = new Session()

  const now = new Date()
  // YYYY-MM-DD_HH-MM-SS
  const filename = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.heapsnapshot`

  const fd = fs.openSync(filename, 'w')

  session.connect()

  session.on('HeapProfiler.addHeapSnapshotChunk', (m) => {
    fs.writeSync(fd, m.params.chunk)
  })

  const result = await session.post('HeapProfiler.takeHeapSnapshot')
  console.log('HeapProfiler.takeHeapSnapshot done:', result)
  session.disconnect()
  fs.closeSync(fd)
}

console.log('Starting heap snapshot dump...')

const THREE_HOURS = 3 * 60 * 60 * 1000
await dumpHeapSnapshot()
setInterval(async () => {
  await dumpHeapSnapshot()
}, THREE_HOURS)