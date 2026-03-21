import { Loader2 } from 'lucide-react'

import { useTranslation } from '@/i18n/client'
import { UploadStep } from '@/services/uploader'

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
    <div className="animate-in fade-in slide-in-from-bottom-6 fixed right-6 bottom-6 duration-300">
      <div className="rounded-xl bg-linear-to-br from-purple-500/80 to-teal-500/80 shadow-lg shadow-purple-500/20 backdrop-blur-xl dark:from-purple-600/80 dark:to-teal-600/80 dark:shadow-purple-900/30">
        <div className="flex items-center gap-3 px-6 py-4">
          <Loader2 className="h-5 w-5 animate-spin text-white" />
          <div className="flex items-center gap-2 font-medium text-white">
            <span>{t(`app.upload.progress.${step}`)}</span>
            <span className="font-bold">
              {at}/{count}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FloatingProgress
