import React, { useState } from 'react'
import { useTranslation } from '@/i18n/client'
import Modal from '@annatarhe/lake-ui/modal'
import { useQuery } from '@tanstack/react-query'
import client from '../../services/pp'
import { CKPromptBookRecommandsVariables, CKPrompts } from '../../types.g'
import { getLanguage } from '@/utils/locales'
import { useMultipleBook } from '@/hooks/book'
import { LoadingState } from './loading-state'
import { ErrorState } from './error-state'
import { EmptyState } from './empty-state'
import { RecommendationContent } from './recommendation-content'

type AIBookRecommendationModalProps = {
  open: boolean
  onClose: () => void
  uid?: number
  books: { doubanId: string }[]
}

function AIBookRecommendationModal({ open, onClose, uid, books }: AIBookRecommendationModalProps) {
  const { t } = useTranslation()

  const [recommendationData, setRecommendationData] = useState<string[]>([])

  const bookList = useMultipleBook(books.map(book => book.doubanId), !open || !books.length || !uid)

  // Create book information string for the API
  const booksInfo = bookList.books.slice(0, 10).map(book =>
    `Title: ${book.title}, Author: ${book.author}, Summary: ${(book.summary ?? '').slice(0, 300)}`
  ).join('\n') || ''

  const { isLoading, error } = useQuery({
    queryKey: ['ai', 'book-recommendation', uid, books?.length, booksInfo],
    queryFn: async () => {
      // This is a placeholder - adjust the actual API call based on your backend implementation
      return client.executeStream<string, CKPromptBookRecommandsVariables>(
        CKPrompts.BookRecommands,
        {
          list: booksInfo,
          lang: getLanguage(),
        },
        uid ? uid.toString() : undefined,
        {
          onData: (chunk) => {
            setRecommendationData(d => [...d, chunk.message])
            return Promise.resolve()
          },
          onEnd: () => {
            return Promise.resolve()
          }
        }
      ).then((final) => {
        setRecommendationData([final.message])
        return final
      })
    },
    enabled: open && booksInfo.length > 0,
  })

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={t('app.home.aiRecommendations') || 'AI Book Recommendations'}
    >
      <div className='relative min-h-[300px] max-h-[calc(90vh-8rem)] overflow-y-auto overflow-x-hidden p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300/50 dark:[&::-webkit-scrollbar-track]:bg-gray-800/20 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600/50'>
        {error ? (
          <ErrorState error={error} />
        ) : recommendationData.length > 0 ? (
          <RecommendationContent recommendationData={recommendationData} isLoading={isLoading} />
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
