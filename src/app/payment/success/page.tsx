import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import DecorBlobs from '@/components/ui/decor-blobs/decor-blobs'
import Surface from '@/components/ui/surface/surface'
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

  const homeLink = `/dash/${uid}/home`

  return (
    <HydrationBoundary state={d}>
      <div className="anna-page-container relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10">
        <DecorBlobs tone="success" />
        <Surface
          variant="elevated"
          className="with-slide-in relative z-10 w-full max-w-xl p-8 md:p-12"
        >
          <PaymentSuccessContent sessionId={sessionId} homeLink={homeLink} />
        </Surface>
      </div>
    </HydrationBoundary>
  )
}

export default PaymentSuccessPage
