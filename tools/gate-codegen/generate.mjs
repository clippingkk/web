import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

import { createClient } from '@hey-api/openapi-ts'
const root = fileURLToPath(new URL('../../', import.meta.url))
await createClient({
  input: `${root}openapi/gate.json`,
  output: `${root}src/gate/generated`,
  plugins: ['@hey-api/typescript', '@hey-api/client-fetch', '@hey-api/sdk'],
})

execFileSync(`${root}node_modules/.bin/oxfmt`, [`${root}src/gate/generated`], {
  stdio: 'inherit',
})
