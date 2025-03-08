import React, { useState } from 'react'
import { useTranslation } from '@/i18n/client'
import Modal from '@annatarhe/lake-ui/modal'
import { MarkdownComponents } from '../RichTextEditor/markdown-components'
import Markdown from 'react-markdown'
import { Loader2, BookOpen, Sparkles } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import client from '../../services/pp'
import { CKPromptBookRecommandsVariables, CKPrompts } from '../../types.g'
import { getLanguage } from '@/utils/locales'
import { useMultipleBook } from '@/hooks/book'

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
    `Title: ${book.title}, Author: ${book.author}, Summary: ${book.summary.slice(0, 300)}`
  ).join('\n') || ''

  const { isLoading, error } = useQuery({
    queryKey: ['ai', 'book-recommendation', uid, books?.length],
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
        {isLoading ? (
          <div className='absolute inset-0 flex flex-col items-center justify-center bg-white/5 backdrop-blur-xs'>
            <Loader2 className='h-8 w-8 animate-spin text-purple-600 dark:text-purple-400 mb-4' />
            <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
              {t('app.home.aiThinking') || 'AI is thinking about your next great read...'}
            </p>
          </div>
        ) : error ? (
          <div className='rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-800/50 dark:bg-red-900/20'>
            <p className='font-medium text-lg text-red-800 dark:text-red-200'>{error.message}</p>
            <p className='mt-2 text-sm text-red-600 dark:text-red-400'>- AI Assistant</p>
          </div>
        ) : recommendationData.length > 0 ? (
          <div className='space-y-6'>
            <div className='bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 p-6 rounded-lg'>
              <h3 className='text-xl font-medium text-purple-800 dark:text-purple-300 mb-3 flex items-center'>
                <Sparkles className='w-5 h-5 mr-2 text-purple-500' />
                {t('app.home.personalizedRecommendations') || 'Your Personalized Recommendations'}
              </h3>
              <div className='prose dark:prose-invert prose-sm max-w-none'>
                <Markdown components={MarkdownComponents}>{recommendationData.join('\n')}</Markdown>
              </div>
            </div>
            <div className='text-sm text-gray-500 dark:text-gray-400 italic'>
              {t('app.home.aiDisclaimer') || 'Recommendations are generated by AI based on your reading history and may not be perfect.'}
            </div>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center text-center p-6'>
            <BookOpen className='w-16 h-16 text-gray-300 dark:text-gray-600 mb-4' />
            <p className='text-gray-500 dark:text-gray-400'>
              {t('app.home.noRecommendations') || 'No recommendations available yet. Try again later.'}
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default AIBookRecommendationModal
