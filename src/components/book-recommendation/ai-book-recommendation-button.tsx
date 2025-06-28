'use client'
import React, { useState } from 'react'
import { useTranslation } from '@/i18n/client'
import { Sparkles } from 'lucide-react'
import AIBookRecommendationModal from './ai-book-recommendation-modal'

type AIBookRecommendationButtonProps = {
  uid?: number
  books: { doubanId: string }[]
}

const AIBookRecommendationButton: React.FC<AIBookRecommendationButtonProps> = ({ uid, books }) => {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="group w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-800/30 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200"
        aria-label={t('app.home.aiRecommendations') || 'AI Book Recommendations'}
      >
        {/* Simple icon */}
        <div className="p-2 bg-purple-100 dark:bg-purple-800/50 rounded-lg">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
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
        <svg className="w-4 h-4 text-purple-500 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
