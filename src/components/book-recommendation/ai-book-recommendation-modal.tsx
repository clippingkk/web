import Modal from '@annatarhe/lake-ui/modal'

import { useMultipleBook } from '@/hooks/book'
import { useAIGeneration } from '@/hooks/use-ai-generation'
import { useTranslation } from '@/i18n/client'
import { getLanguage } from '@/utils/locales'

import { EmptyState } from './empty-state'
import { ErrorState } from './error-state'
import { LoadingState } from './loading-state'
import { RecommendationContent } from './recommendation-content'

type AIBookRecommendationModalProps = {
  open: boolean
  onClose: () => void
  uid?: number
  books: { doubanId: string }[]
}

function AIBookRecommendationModal({
  open,
  onClose,
  uid,
  books,
}: AIBookRecommendationModalProps) {
  const { t } = useTranslation()

  const bookList = useMultipleBook(
    books.slice(0, 10).map((book) => book.doubanId),
    !open || !books.length || !uid
  )

  const recommendationBooks = bookList.books.slice(0, 10).map((book) => ({
    title: book.title,
    author: book.author,
    summary: (book.summary ?? '').slice(0, 300),
  }))
  const { text, isLoading, error } = useAIGeneration(
    'recommendations',
    {
      language: getLanguage(),
      books: recommendationBooks,
    },
    open && recommendationBooks.length > 0
  )
  const recommendationData = text ? [text] : []

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={t('app.home.aiRecommendations') || 'AI Book Recommendations'}
    >
      <div className="relative max-h-[calc(90vh-8rem)] min-h-[300px] overflow-x-hidden overflow-y-auto p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300/50 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600/50 [&::-webkit-scrollbar-track]:bg-gray-100/20 dark:[&::-webkit-scrollbar-track]:bg-gray-800/20">
        {error ? (
          <ErrorState error={error} />
        ) : recommendationData.length > 0 ? (
          <RecommendationContent
            recommendationData={recommendationData}
            isLoading={isLoading}
          />
        ) : isLoading ? (
          <LoadingState />
        ) : (
          <EmptyState />
        )}
      </div>
    </Modal>
  )
}

export default AIBookRecommendationModal
