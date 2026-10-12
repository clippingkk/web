import { z } from 'zod'

import { body, noStore } from '@/app/api/auth/native/shared'
import { requireUserId } from '@/server/auth'
import {
  listEmailBindings,
  requestEmailBinding,
} from '@/server/email-import/bindings'
import { options, route } from '@/server/http'

/**
 * Addresses a reader imports Kindle notebook exports from, managed from
 * Settings → Email import. POST adds an address, or mails a pending one a new
 * code.
 */

const createSchema = z.object({ email: z.string().trim().min(3).max(255) })

export const GET = route(async (request) => {
  const userId = await requireUserId(request)
  return noStore(await listEmailBindings(userId))
}, 'email_import.bindings.list')

export const POST = route(async (request) => {
  const userId = await requireUserId(request)
  const { email } = await body(request, createSchema)
  return noStore(await requestEmailBinding(userId, email), 201)
}, 'email_import.bindings.create')

export const OPTIONS = options
