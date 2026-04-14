import type { WenquBook } from '@/services/wenqu'

import BookSummarySectionClient from './book-summary-section-client'

type Props = {
  book: WenquBook
  title: string
  showMoreLabel: string
  showLessLabel: string
}

function BookSummarySection({
  book,
  title,
  showMoreLabel,
  showLessLabel,
}: Props) {
  if (!book.summary) {
    return null
  }

  return (
    <BookSummarySectionClient
      summary={book.summary}
      title={title}
      showMoreLabel={showMoreLabel}
      showLessLabel={showLessLabel}
    />
  )
}

export default BookSummarySection
