import { useQuery } from '@tanstack/react-query'
import party from 'party-js'
import { Text } from '@mantine/core'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import DashboardContainer from '../../components/dashboard-container/container'
import NavigateGuide from '../../components/navigation-bar/navigate-guide'
import { getPaymentOrderInfo } from '../../services/payment'
import Link from 'next/link'
import { useAtomValue } from 'jotai'
import { useSelector } from 'react-redux'
import { TGlobalStore } from '../../store'
import { UserContent } from '../../store/user/type'

type PaymentSuccessPageProps = {
}

function PaymentSuccessPage(props: PaymentSuccessPageProps) {
  const sessionId = useRouter().query.sessionId as string

  useEffect(() => {
    party.confetti(document.querySelector('body')!)
  }, [])

  // use server response
  const { data, isLoading } = useQuery({
    queryKey: ['payment', 'result', sessionId],
    queryFn: () => getPaymentOrderInfo(sessionId),
    enabled: !!sessionId,
    onSuccess() {
      party.confetti(document.querySelector('body')!)
    },
    onError(err) {
      console.log('exxxx', err)
      toast.error('got error, your payment might not been process conrdly')
    },
  })
  const p = useSelector<TGlobalStore, UserContent>(s => s.user.profile)

  const homeLink = useMemo(() => {
    if (p && p.id > 0) {
      return `/dash/${p.domain.length > 1 ? p.domain : p.id}/home`
    }
    return '/auth/auth-v3'
  }, [p])

  return (
    <div className=' w-full h-full flex flex-col items-center justify-center dark:text-gray-100 pt-20'>
      <Text
        className=' text-6xl'
      >Congratulation! </Text>
      <Text
        className=' text-2xl mt-20'
      >
        Welcome to join Premier
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

PaymentSuccessPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <DashboardContainer header={<NavigateGuide title='Success' />}>
      {page}
    </DashboardContainer>
  )
}

export default PaymentSuccessPage
