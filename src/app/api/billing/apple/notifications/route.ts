import { receiveAppleNotification } from '@/server/billing/apple/handlers'
import { route } from '@/server/http'

// App Store Server Notifications V2. In App Store Connect, set both the
// production and sandbox URLs to /api/billing/apple/notifications.
export const POST = route(
  receiveAppleNotification,
  'billing.apple.notification'
)
