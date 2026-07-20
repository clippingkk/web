export type ApiSuccessResponse<T> = {
  status: number
  msg: string
  data: T
}

export type ApiErrorResponse = {
  status: number
  msg: string
  error: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export type UploadImageResponse = {
  filePath: string
}

export type CreatePaymentSubscriptionRequest = {
  priceId: string
}

export type CreatePaymentSubscriptionResponse = {
  checkoutUrl: string
}

export type PaymentOrderInfoResponse = {
  uid: number
  amount: number | null
  paymentStatus: 'paid' | 'unpaid' | 'no_payment_required'
}

export type CancelPaymentSubscriptionRequest = {
  subscriptionId: string
}

export type CancelPaymentSubscriptionResponse = {
  id: string
  status: string
}
