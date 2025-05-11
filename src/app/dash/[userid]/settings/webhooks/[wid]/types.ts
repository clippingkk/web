/**
 * Types for webhook records and related data
 */
export interface WebhookRecord {
  id: string
  createdAt: string
  content: string
  status: number
  statusMessage?: string
}

export interface WebhookData {
  id: number
  step: string
  hookUrl: string
  records: WebhookRecord[]
}
