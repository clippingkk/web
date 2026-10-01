export type ApiSuccessResponse<T> = {
  status: number
  msg: string
  data: T
}

export type ApiErrorResponse = {
  status: number
  msg: string
  error: string
  /** Machine-readable reason, e.g. `PREMIUM_REQUIRED` or `ALREADY_PREMIUM`. */
  code?: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export type UploadImageResponse = {
  filePath: string
}

export type CreatePaymentSubscriptionResponse = {
  checkoutUrl: string
}

export type PaymentOrderInfoResponse = {
  premiumActive?: boolean
  uid: number
  amount: number | null
  paymentStatus: 'paid' | 'unpaid' | 'no_payment_required'
}
