'use client'
import { Sparkles } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'

import { useTranslation } from '@/i18n/client'

import AIBookRecommendationModal from './ai-book-recommendation-modal'

type AIBookRecommendationButtonProps = {
  uid?: number
  books: { doubanId: string }[]
}

const AIBookRecommendationButton: React.FC<AIBookRecommendationButtonProps> = ({
  uid,
  books,
}) => {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="group flex w-full items-center gap-3 rounded-xl border border-purple-200/50 bg-gradient-to-r from-purple-50 to-pink-50 p-4 transition-all duration-200 hover:border-purple-300 dark:border-purple-800/30 dark:from-purple-900/20 dark:to-pink-900/20 dark:hover:border-purple-700"
        aria-label={
          t('app.home.aiRecommendations') || 'AI Book Recommendations'
        }
      >
        {/* Simple icon */}
        <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-800/50">
          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>

        {/* Simple text */}
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-zinc-100">
            {t('app.home.aiRecommend', 'AI Book Recommendations')}
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-500">
            Discover your next great read
          </div>
        </div>

        {/* Simple arrow */}
        <svg
          className="h-4 w-4 text-purple-500 transition-transform group-hover:translate-x-0.5 dark:text-purple-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* AI Book Recommendation Modal */}
      <AIBookRecommendationModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        uid={uid}
        books={books}
      />
    </>
  )
}

export default AIBookRecommendationButton
