import { z } from 'zod'

import { exchangeNative } from '@/server/gate/native'
import { route } from '@/server/http'

import { body, noStore } from '../shared'

const schema = z
  .object({
    transactionId: z.string().max(128),
    state: z.string().max(128),
    code: z.string().min(1).max(2048),
    verifier: z.string().min(43).max(128),
  })
  .strict()

export const POST = route(
  async (request) => noStore(await exchangeNative(await body(request, schema))),
  'auth.native.exchange'
)
