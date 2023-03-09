import { request } from "./ajax";

export function getPaymentSubscription(priceId: string) {
  return request<{ checkoutUrl: string }>('/v2/payment-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ priceId })
  })
}

export function getPaymentOrderInfo(sessionId: string) {
  return request<{
    uid: number,
    amount: number,
    paymentStatus: string
  }>(`/v2/payment-order-info?sessionId=${sessionId}`)
}
