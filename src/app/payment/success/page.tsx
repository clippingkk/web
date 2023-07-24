import { Hydrate, dehydrate } from '@tanstack/react-query'
import React from 'react'
import { getPaymentOrderInfo } from '../../../services/payment'
import { getReactQueryClient } from '../../../services/ajax'
import PaymentSuccessContent from './content'

type PaymentSuccessPageProps = {
  params: {}
  searchParams: { sessionId: string, uid: string }
}

async function PaymentSuccessPage(props: PaymentSuccessPageProps) {
  // const sessionId = useRouter().query.sessionId as string
  const { sessionId, uid } = props.searchParams

  const rq = getReactQueryClient()

  await rq.prefetchQuery({
    queryKey: ['payment', 'result', sessionId],
    queryFn: () => getPaymentOrderInfo(sessionId),
  })

  const d = dehydrate(rq)

  // use server response
  const homeLink = `/dash/${uid}/home`

  return (
    <Hydrate state={d}>
      <div className=' w-full h-full flex flex-col items-center justify-center dark:text-gray-100 pt-20'>
        <PaymentSuccessContent
          sessionId={sessionId}
          homeLink={homeLink}
        />
      </div>
    </Hydrate>
  )
}

export default PaymentSuccessPage
