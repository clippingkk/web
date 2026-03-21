'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import party from 'party-js'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

import { getPaymentOrderInfo } from '@/services/payment'

type PaymentSuccessContentProps = {
  sessionId: string
  homeLink: string
}

function PaymentSuccessContent(props: PaymentSuccessContentProps) {
  const { sessionId, homeLink } = props
  const { data, error } = useQuery({
    queryKey: ['payment', 'result', sessionId],
    queryFn: () => getPaymentOrderInfo(sessionId),
    enabled: !!sessionId,
  })
  useEffect(() => {
    if (error) {
      toast.error('got error, your payment might not been process conrdly')
    }
  }, [error])

  useEffect(() => {
    if (data) {
      party.confetti(document.querySelector('body')!)
    }
  }, [data])

  useEffect(() => {
    if (!data || data.paymentStatus !== 'paid') {
      return
    }
    party.confetti(document.querySelector('body')!)
  }, [data])

  return (
    <div className="flex h-full w-full flex-col items-center justify-center pt-20 dark:text-gray-100">
      <span className="text-6xl">Congratulation! </span>
      <span className="mt-20 text-2xl">Welcome to join Premium</span>
      <Link href={homeLink as any} className="mt-8">
        go to my profile
      </Link>
    </div>
  )
}

export default PaymentSuccessContent
