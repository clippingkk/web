import React from 'react'
import { UploadStep } from '@/services/uploader'
import { useTranslation } from '@/i18n/client'
import { Loader2 } from 'lucide-react'

type FloatingProgressProps = {
  step: UploadStep
  at: number
  count: number
}

function FloatingProgress(props: FloatingProgressProps) {
  const { step, at, count } = props
  const { t } = useTranslation()
  if (step === UploadStep.None || at === -1 || count === -1) {
    return null
  }
  return (
    <div className="fixed bottom-6 right-6 animate-in fade-in slide-in-from-bottom-6 duration-300">
      <div className="backdrop-blur-xl bg-linear-to-br from-purple-500/80 to-teal-500/80 dark:from-purple-600/80 dark:to-teal-600/80 rounded-xl shadow-lg shadow-purple-500/20 dark:shadow-purple-900/30">
        <div className="px-6 py-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-white animate-spin" />
          <div className="flex items-center gap-2 text-white font-medium">
            <span>
              {t(`app.upload.progress.${step}`)}
            </span>
            <span className="font-bold">{at}/{count}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FloatingProgress
