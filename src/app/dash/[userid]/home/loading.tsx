import Spinner from '@annatarhe/lake-ui/spinner'

import { BookShelfSkeleton } from '@/components/book/book-card-skeleton'
import Page from '@/components/layout/page'
import PageHeaderSkeleton from '@/components/layout/page-header-skeleton'

function Loading() {
  return (
    <Page width="wide">
      <PageHeaderSkeleton />
      <BookShelfSkeleton count={12} />
      <Spinner size="sm" className="sr-only" />
    </Page>
  )
}

export default Loading
