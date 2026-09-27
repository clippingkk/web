import Button from '@annatarhe/lake-ui/button'
import EmptyState from '@annatarhe/lake-ui/empty-state'
import { BookX } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import Page from '@/components/layout/page'
import MarketingShell from '@/components/shell/marketing-shell'
import { getTranslation } from '@/i18n'

export const metadata: Metadata = {
  title: 'Page not found · ClippingKK',
  description: 'The page you are looking for does not exist.',
}

async function NotFound() {
  const { t } = await getTranslation(undefined, 'common')

  return (
    <MarketingShell>
      <Page width="reading" className="flex-1 justify-center py-20 md:py-28">
        <EmptyState
          icon={<BookX className="size-6" />}
          title={t('notFound.title')}
          description={t('notFound.description')}
          headingLevel={1}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="primary" render={<Link href="/" />}>
                {t('notFound.home')}
              </Button>
              <Button variant="ghost" render={<Link href="/policy/support" />}>
                {t('notFound.support')}
              </Button>
            </div>
          }
        />
      </Page>
    </MarketingShell>
  )
}

export default NotFound
