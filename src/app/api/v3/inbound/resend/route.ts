import { receiveResendWebhook } from '@/server/email-import/webhook'
import { route } from '@/server/http'

/** Resend inbound mail: Kindle notebook exports readers email to ClippingKK. */
export const POST = route(receiveResendWebhook, 'email_import.webhook')
