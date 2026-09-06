import { ApiError } from '@/server/errors'
import { route } from '@/server/http'
export const POST = route(async () => {
  throw new ApiError('Configure Stripe webhooks on Gate.', 410, 'BILLING_MOVED')
}, 'payment.legacy.webhook')
