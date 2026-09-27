'use client'

import Button from '@annatarhe/lake-ui/button'
import type React from 'react'

import { useTranslation } from '@/i18n/client'

type ExportCardProps = {
  onClick: () => void
  icon: React.ReactNode
  title: string
  description: string
}

/** One export destination: what it does and a button to start. */
function ExportTriggerButton({
  onClick,
  icon,
  title,
  description,
}: ExportCardProps) {
  const { t } = useTranslation(undefined, 'settings')
  return (
    <div className="rounded-lake-panel border-lake-line bg-lake-surface flex h-full flex-col gap-4 border p-5">
      <div className="flex h-10 items-center [&_img]:h-8 [&_img]:w-auto [&_svg]:size-8">
        {icon}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <h3 className="text-lake-fg font-medium">{title}</h3>
        <p className="text-lake-fg-muted text-sm">{description}</p>
      </div>
      <Button
        variant="secondary"
        size="sm"
        className="self-start"
        onClick={onClick}
      >
        {t('exports.start')}
      </Button>
    </div>
  )
}

export default ExportTriggerButton
