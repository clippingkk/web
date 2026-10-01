import { receiveAppleNotification } from '@/server/billing/apple/handlers'
import { options, route } from '@/server/http'

// The URL App Store Connect may still point at; same handler as
// /api/billing/apple/notifications.
export const POST = route(
  receiveAppleNotification,
  'apple.notification.process'
)
export const OPTIONS = options
