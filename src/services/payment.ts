import type { PaymentOrderInfoResponse } from '@/contracts/http'

import { request } from './ajax'

export function getPaymentOrderInfo(sessionId: string) {
  const params = new URLSearchParams({ sessionId })
  return request<PaymentOrderInfoResponse>(
    `/v2/payment-order-info?${params.toString()}`
  )
}
