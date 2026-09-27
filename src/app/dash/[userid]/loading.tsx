import Spinner from '@annatarhe/lake-ui/spinner'

import Page from '@/components/layout/page'

function Loading() {
  return (
    <Page width="default" className="items-center py-24">
      <Spinner size="md" />
    </Page>
  )
}

export default Loading
