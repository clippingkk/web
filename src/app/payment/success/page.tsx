import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getReactQueryClient } from '@/services/ajax'
import { getPaymentOrderInfo } from '@/services/payment'
import PaymentSuccessContent from './content'

type PaymentSuccessPageProps = {
  searchParams: Promise<{ sessionId: string; uid: string }>
}

async function PaymentSuccessPage(props: PaymentSuccessPageProps) {
  const { sessionId, uid } = await props.searchParams

  const rq = getReactQueryClient()

  await rq.prefetchQuery({
    queryKey: ['payment', 'result', sessionId],
    queryFn: () => getPaymentOrderInfo(sessionId),
  })

  const d = dehydrate(rq)

  // use server response
  const homeLink = `/dash/${uid}/home`

  return (
    <HydrationBoundary state={d}>
      <div className="flex h-full w-full flex-col items-center justify-center pt-20 dark:text-gray-100">
        <PaymentSuccessContent sessionId={sessionId} homeLink={homeLink} />
      </div>
    </HydrationBoundary>
  )
}

export default PaymentSuccessPage
