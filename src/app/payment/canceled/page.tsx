import Button from '@annatarhe/lake-ui/button'
import EmptyState from '@annatarhe/lake-ui/empty-state'
import { CircleSlash } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import Page from '@/components/layout/page'
import { getTranslation } from '@/i18n'
import { pageMetadata } from '@/lib/metadata'
import { getViewer } from '@/server/data/viewer'
import { dashHref } from '@/utils/profile.utils'

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation(undefined, 'payment')
  return pageMetadata({ title: t('canceled.meta.title') })
}

async function CanceledPage() {
  const [viewer, { t }] = await Promise.all([
    getViewer(),
    getTranslation(undefined, 'payment'),
  ])
  return (
    <Page width="reading" className="flex-1 justify-center py-20 md:py-28">
      <EmptyState
        headingLevel={1}
        icon={<CircleSlash className="size-6" />}
        title={t('canceled.title')}
        description={t('canceled.description')}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="primary" render={<Link href="/pricing" />}>
              {t('canceled.pricing')}
            </Button>
            {viewer ? (
              <Button
                variant="ghost"
                render={<Link href={dashHref(viewer, 'home')} />}
              >
                {t('canceled.library')}
              </Button>
            ) : (
              <Button variant="ghost" render={<Link href="/" />}>
                {t('canceled.home')}
              </Button>
            )}
          </div>
        }
      />
    </Page>
  )
}

export default CanceledPage
