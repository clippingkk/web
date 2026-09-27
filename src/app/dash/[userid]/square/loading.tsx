import { ClippingGridSkeleton } from '@/components/clipping/clipping-card-skeleton'
import Page from '@/components/layout/page'
import PageHeaderSkeleton from '@/components/layout/page-header-skeleton'

function Loading() {
  return (
    <Page width="wide">
      <PageHeaderSkeleton />
      <ClippingGridSkeleton count={9} />
    </Page>
  )
}

export default Loading
