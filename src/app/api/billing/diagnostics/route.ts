import { requireUserId } from '@/server/auth'
import { billingDiagnostics } from '@/server/billing/diagnostics'
import { ApiError } from '@/server/errors'
import { canAdmin } from '@/server/gate/authz'
import { json, route } from '@/server/http'

/** Admin-only: is every piece Premium depends on configured and reachable? */
export const GET = route(async (request) => {
  const userId = await requireUserId(request)
  if (!(await canAdmin(userId)))
    throw new ApiError('Administrators only', 403, 'FORBIDDEN')
  const checks = await billingDiagnostics(userId)
  const response = json({ ok: checks.every((c) => c.ok), checks })
  response.headers.set('Cache-Control', 'no-store')
  return response
}, 'billing.diagnostics')
