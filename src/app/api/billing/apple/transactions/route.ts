import { submitAppleTransaction } from '@/server/billing/apple/handlers'
import { options, route } from '@/server/http'

export const POST = route(submitAppleTransaction, 'billing.apple.transaction')
export const OPTIONS = options
