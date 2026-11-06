'use client'

import Button from '@annatarhe/lake-ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { useTranslation } from '@/i18n/client'

/** What a free reader sees in place of an AI feature. It never calls the model. */
function AIPremiumPrompt({ description }: { description: string }) {
  const { t } = useTranslation(undefined, 'ai')

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="type-body text-lake-fg-muted max-w-2xl">{description}</p>
      <Button
        variant="secondary"
        size="sm"
        trailingIcon={<ArrowRight className="size-3.5" />}
        render={<Link href="/pricing" />}
      >
        {t('actions.upgrade')}
      </Button>
    </div>
  )
}

export default AIPremiumPrompt
