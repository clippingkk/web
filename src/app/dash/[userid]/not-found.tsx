import Button from '@annatarhe/lake-ui/button'
import EmptyState from '@annatarhe/lake-ui/empty-state'
import { UserX } from 'lucide-react'
import Link from 'next/link'

import Page from '@/components/layout/page'
import { getTranslation } from '@/i18n'

async function DashNotFound() {
  const { t } = await getTranslation(undefined, 'common')
  return (
    <Page width="reading" className="py-20">
      <EmptyState
        icon={<UserX className="size-6" />}
        title={t('notFound.title')}
        description={t('notFound.description')}
        action={
          <Button variant="secondary" render={<Link href="/" />}>
            {t('notFound.home')}
          </Button>
        }
      />
    </Page>
  )
}

export default DashNotFound
