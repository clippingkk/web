'use client';
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import React, { useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import party from 'party-js'
import { Text } from '@mantine/core'
import { useSelector } from 'react-redux'
import { getPaymentOrderInfo } from '../../../services/payment'
import { TGlobalStore } from '../../../store'
import { UserContent } from '../../../store/user/type'

type PaymentSuccessContentProps = {
  sessionId: string
  homeLink: string
}

function PaymentSuccessContent(props: PaymentSuccessContentProps) {
  const { sessionId, homeLink } = props
  const { data, isLoading } = useQuery({
    queryKey: ['payment', 'result', sessionId],
    queryFn: () => getPaymentOrderInfo(sessionId),
    enabled: !!sessionId,
    onSuccess() {
      party.confetti(document.querySelector('body')!)
    },
    onError(err) {
      toast.error('got error, your payment might not been process conrdly')
    },
  })

  useEffect(() => {
    if (!data || data.paymentStatus != 'paid') {
      return
    }
    party.confetti(document.querySelector('body')!)
  }, [data])
  const p = useSelector<TGlobalStore, UserContent>(s => s.user.profile)

  return (
    <div className=' w-full h-full flex flex-col items-center justify-center dark:text-gray-100 pt-20'>
      <Text
        className=' text-6xl'
      >Congratulation! </Text>
      <Text
        className=' text-2xl mt-20'
      >
        Welcome to join Premium
      </Text>
      <Link
        href={homeLink}
        className='mt-8'
      >
        go to my profile
      </Link>
    </div>
  )
}

export default PaymentSuccessContent
