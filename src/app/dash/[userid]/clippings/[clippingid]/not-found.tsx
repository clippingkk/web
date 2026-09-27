import EmptyState from '@annatarhe/lake-ui/empty-state'
import { EyeOff } from 'lucide-react'

import Page from '@/components/layout/page'
import BackToLibraryButton from '@/components/user/back-to-library-button'
import { getTranslation } from '@/i18n'

async function ClippingNotFound() {
  const { t } = await getTranslation(undefined, 'reading')
  return (
    <Page width="reading" className="py-20">
      <EmptyState
        icon={<EyeOff className="size-6" />}
        title={t('notFound.title')}
        description={t('notFound.description')}
        action={
          <BackToLibraryButton section="square" label={t('notFound.action')} />
        }
      />
    </Page>
  )
}

export default ClippingNotFound
