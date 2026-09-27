import Button from '@annatarhe/lake-ui/button'
import EmptyState from '@annatarhe/lake-ui/empty-state'
import { ReceiptText } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import Page from '@/components/layout/page'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { requireViewer } from '@/server/data/viewer'
import { dashHref } from '@/utils/profile.utils'

import PaymentSuccessContent from './content'

type SearchValue = string | string[] | undefined

type PaymentSuccessPageProps = {
  searchParams: Promise<{ sessionId?: SearchValue; session_id?: SearchValue }>
}

function first(value: SearchValue) {
  return (Array.isArray(value) ? value[0] : value)?.trim() || undefined
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'payment')
  return pageMetadata({ title: t('success.meta.title') })
}

async function PaymentSuccessPage(props: PaymentSuccessPageProps) {
  const params = await props.searchParams
  // Gate's success URL says `sessionId`; Stripe's own template says
  // `session_id`. Accept either.
  const sessionId = first(params.sessionId) ?? first(params.session_id)
  const [viewer, { t }] = await Promise.all([
    requireViewer(),
    getTranslation(undefined, 'payment'),
  ])
  const subscriptionHref = dashHref(viewer, 'settings/orders')

  return (
    <Page width="reading" className="flex-1 justify-center py-20 md:py-28">
      {sessionId ? (
        <PaymentSuccessContent
          sessionId={sessionId}
          libraryHref={dashHref(viewer, 'home')}
          subscriptionHref={subscriptionHref}
        />
      ) : (
        <EmptyState
          headingLevel={1}
          icon={<ReceiptText className="size-6" />}
          title={t('success.missing.title')}
          description={t('success.missing.description')}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant="primary"
                render={<Link href={subscriptionHref} />}
              >
                {t('success.subscriptionSettings')}
              </Button>
              <Button variant="ghost" render={<Link href="/pricing" />}>
                {t('success.pricing')}
              </Button>
            </div>
          }
        />
      )}
    </Page>
  )
}

export default PaymentSuccessPage
