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
        className="group relative overflow-hidden bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white font-medium py-2 px-6 rounded-md shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] flex items-center"
        aria-label={t('app.home.aiRecommendations') || 'AI Book Recommendations'}
      >
        {/* Button Label */}
        <span className="relative z-10 flex items-center">
          <Sparkles className="w-4 h-4 mr-2 animate-pulse text-yellow-300" />
          {t('app.home.aiRecommend') || 'AI Recommend'}
        </span>

        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-700 to-fuchsia-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Animated Particles Effect */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-0 left-0 w-1 h-1 rounded-full bg-white animate-float-up transform -translate-x-1/2"></div>
          <div className="absolute top-0 left-1/4 w-1 h-1 rounded-full bg-white animate-float-up animation-delay-300 transform -translate-x-1/2"></div>
          <div className="absolute top-0 left-1/2 w-1.5 h-1.5 rounded-full bg-white animate-float-up animation-delay-600 transform -translate-x-1/2"></div>
          <div className="absolute top-0 left-3/4 w-1 h-1 rounded-full bg-white animate-float-up animation-delay-900 transform -translate-x-1/2"></div>
          <div className="absolute top-0 right-0 w-1 h-1 rounded-full bg-white animate-float-up animation-delay-1200 transform -translate-x-1/2"></div>
        </div>
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
