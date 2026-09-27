import EmptyState from '@annatarhe/lake-ui/empty-state'
import { BookX } from 'lucide-react'

import Page from '@/components/layout/page'
import BackToLibraryButton from '@/components/user/back-to-library-button'
import { getTranslation } from '@/i18n'

async function BookNotFound() {
  const { t } = await getTranslation(undefined, 'library')
  return (
    <Page width="reading" className="py-20">
      <EmptyState
        icon={<BookX className="size-6" />}
        title={t('book.notFound.title')}
        description={t('book.notFound.description')}
        action={<BackToLibraryButton label={t('book.notFound.action')} />}
      />
    </Page>
  )
}

export default BookNotFound
