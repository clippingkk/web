'use client'
import Button from '@annatarhe/lake-ui/button'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'

import { useTranslation } from '@/i18n/client'

import AIBookRecommendationModal from './ai-book-recommendation-modal'

type AIBookRecommendationButtonProps = {
  uid?: number
  books: { doubanId: string }[]
}

function AIBookRecommendationButton({
  uid,
  books,
}: AIBookRecommendationButtonProps) {
  const { t } = useTranslation(undefined, 'library')
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        leadingIcon={<Sparkles className="size-4" />}
        onClick={() => setIsModalOpen(true)}
      >
        {t('home.recommend')}
      </Button>
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
