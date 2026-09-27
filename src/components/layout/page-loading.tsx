import Spinner from '@annatarhe/lake-ui/spinner'

import Page from './page'

type PageLoadingProps = {
  label?: string
}

/** A quiet, centered spinner for short status pages (payment, reports). */
function PageLoading({ label }: PageLoadingProps) {
  return (
    <Page
      width="reading"
      className="flex-1 items-center justify-center py-28 md:py-36"
    >
      <Spinner size="md" label={label} />
    </Page>
  )
}

export default PageLoading
