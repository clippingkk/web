import type { InboundEmailStatus } from '@/server/email-import/records'

export type InboundEmailTone =
  | 'success'
  | 'accent'
  | 'warning'
  | 'danger'
  | 'neutral'

/** Badge tone per status: green imported, red refused or given up on. */
export const INBOUND_EMAIL_TONE: Record<InboundEmailStatus, InboundEmailTone> =
  {
    imported: 'success',
    replied: 'accent',
    reply_limited: 'warning',
    not_addressed: 'neutral',
    unreadable_sender: 'warning',
    failed_authentication: 'danger',
    missing: 'neutral',
    no_notebook: 'warning',
    retrying: 'warning',
    failed: 'danger',
  }
