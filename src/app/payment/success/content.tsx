'use client'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, PartyPopper } from 'lucide-react'
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
    <div className="flex flex-col items-center text-center">
      <span className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-400/20 dark:bg-emerald-400/15">
        <PartyPopper className="h-10 w-10 text-emerald-500 dark:text-emerald-300" />
      </span>
      <h1 className="mb-2 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-4xl font-semibold tracking-tight text-transparent md:text-5xl">
        Congratulations!
      </h1>
      <p className="mb-8 text-lg text-slate-600 dark:text-slate-300">
        Welcome to ClippingKK Premium.
      </p>
      <Link
        href={homeLink as any}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-400 px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md dark:bg-blue-400 dark:text-slate-950 dark:hover:bg-blue-300"
      >
        Go to my profile
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

export default PaymentSuccessContent
