import { noStore } from '@/app/api/auth/native/shared'
import { requireUserId } from '@/server/auth'
import {
  listEmailBindings,
  MAX_EMAIL_BINDINGS,
} from '@/server/email-import/bindings'
import { listInboundEmails } from '@/server/email-import/records'
import { getServerEnv } from '@/server/env'
import { options, route } from '@/server/http'

/**
 * Everything Settings → Email import shows, for the iOS app: where to send
 * exports (null while the server has no import address), the reader's sending
 * addresses, and their latest emails without the administrators' details.
 */
export const GET = route(async (request) => {
  const userId = await requireUserId(request)
  const [bindings, history] = await Promise.all([
    listEmailBindings(userId),
    listInboundEmails(userId),
  ])
  return noStore({
    address: getServerEnv().INBOUND_EMAIL_ADDRESS || null,
    maxBindings: MAX_EMAIL_BINDINGS,
    bindings,
    history,
  })
}, 'email_import.overview')

export const OPTIONS = options
