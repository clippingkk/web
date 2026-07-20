import type {
  CancelPaymentSubscriptionRequest,
  CancelPaymentSubscriptionResponse,
  CreatePaymentSubscriptionRequest,
  CreatePaymentSubscriptionResponse,
  PaymentOrderInfoResponse,
} from '@/contracts/http'

import { request, requestJson } from './ajax'

export function getPaymentSubscription(
  priceId: string,
  options?: {
    headers?: Record<string, string>
  }
) {
  const payload: CreatePaymentSubscriptionRequest = { priceId }
  return requestJson<
    CreatePaymentSubscriptionResponse,
    CreatePaymentSubscriptionRequest
  >('/v2/payment-subscription', 'POST', payload, options)
}

export function getPaymentOrderInfo(sessionId: string) {
  const params = new URLSearchParams({ sessionId })
  return request<PaymentOrderInfoResponse>(
    `/v2/payment-order-info?${params.toString()}`
  )
}

export function cancelPaymentSubscription(subscriptionId: string) {
  const payload: CancelPaymentSubscriptionRequest = { subscriptionId }
  return requestJson<
    CancelPaymentSubscriptionResponse,
    CancelPaymentSubscriptionRequest
  >('/v2/payment/subscription/cancel', 'DELETE', payload)
}
