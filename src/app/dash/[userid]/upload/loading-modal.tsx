import Modal from '@annatarhe/lake-ui/modal'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useMemo } from 'react'
import AnimateOnChange from '@/components/SimpleAnimation/AnimateOnChange'
import { useTranslation } from '@/i18n/client'
import { cn } from '@/lib/utils'
import { UploadStep } from '@/services/uploader'

type LoadingModalProps = {
  stepAt: UploadStep
  count: number
  at: number
  message?: string
  visible?: boolean
}

function LoadingModal(props: LoadingModalProps) {
  const { visible = false } = props
  const { t } = useTranslation()
  const progress = useMemo(() => {
    return Math.min(100, Math.round((props.at / props.count) * 100)) || 0
  }, [props.at, props.count])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStepIcon = (step: UploadStep) => {
    switch (step) {
      case UploadStep.Done:
        return <CheckCircle className="text-green-500" size={28} />
      case UploadStep.Error:
        return <AlertCircle className="text-red-500" size={28} />
      default:
        return (
          <div className="h-7 w-7 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
        )
    }
  }

  const isCurrentStep = (step: UploadStep) => props.stepAt === step
  const isPastStep = (step: UploadStep) => {
    return (
      Object.values(UploadStep).indexOf(props.stepAt) >
      Object.values(UploadStep).indexOf(step)
    )
  }

  return (
    <Modal
      title={t('app.upload.tips.extracting')}
      isOpen={visible}
      onClose={() => {}}
    >
      <div className="p-6">
        <div className="mb-8 w-full">
          <h2 className="mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-center text-2xl font-bold text-transparent md:text-3xl">
            {t('app.upload.tips.extracting')}
          </h2>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {t('app.upload.tips.wait') ??
              'Please wait while we process your clippings'}
          </p>
        </div>

        <div className="mb-8 w-full px-4">
          <div className="relative">
            <div className="absolute top-4 left-0 z-0 h-0.5 w-full bg-gray-200 dark:bg-gray-700"></div>
            <div
              className="absolute top-4 left-0 z-10 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-in-out"
              style={{
                width: `${props.stepAt === UploadStep.Done ? 100 : progress}%`,
              }}
            ></div>

            <div className="relative z-20 flex justify-between">
              {Object.values(UploadStep)
                .filter((step) => typeof step === 'number')
                .map((step, index) => {
                  const stepKey = `app.upload.progress.${step}`
                  const stepLabel = t(stepKey, {
                    defaultValue: `Step ${index + 1}`,
                  })
                  const shortLabel = stepLabel.split(' ')[0]

                  return (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300',
                          isCurrentStep(step as UploadStep)
                            ? 'bg-blue-500 text-white dark:bg-blue-600'
                            : '',
                          isPastStep(step as UploadStep)
                            ? 'bg-green-100 text-green-500 dark:bg-green-900'
                            : '',
                          !isCurrentStep(step as UploadStep) &&
                            !isPastStep(step as UploadStep)
                            ? 'bg-gray-100 dark:bg-gray-800'
                            : ''
                        )}
                      >
                        {isCurrentStep(step as UploadStep) && (
                          <Loader2 size={18} className="animate-spin" />
                        )}
                        {isPastStep(step as UploadStep) && (
                          <CheckCircle size={18} />
                        )}
                        {!isCurrentStep(step as UploadStep) &&
                          !isPastStep(step as UploadStep) && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {index + 1}
                            </span>
                          )}
                      </div>
                      <span
                        className={cn(
                          'mt-2 text-center text-xs',
                          isCurrentStep(step as UploadStep)
                            ? 'font-medium text-blue-500 dark:text-blue-400'
                            : '',
                          isPastStep(step as UploadStep)
                            ? 'text-green-500 dark:text-green-400'
                            : '',
                          !isCurrentStep(step as UploadStep) &&
                            !isPastStep(step as UploadStep)
                            ? 'text-gray-500 dark:text-gray-400'
                            : ''
                        )}
                      >
                        {shortLabel}
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>

        <div className="mb-6 w-full rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
          <div className="mb-2 flex items-center">
            <div
              className={cn(
                'mr-4 flex h-12 w-12 items-center justify-center rounded-full',
                props.stepAt === UploadStep.Done
                  ? 'bg-green-100 text-green-500 dark:bg-green-900/30'
                  : '',
                props.stepAt === UploadStep.Error
                  ? 'bg-red-100 text-red-500 dark:bg-red-900/30'
                  : '',
                props.stepAt !== UploadStep.Done &&
                  props.stepAt !== UploadStep.Error
                  ? 'bg-blue-100 text-blue-500 dark:bg-blue-900/30'
                  : ''
              )}
            >
              <AnimateOnChange>
                <span className="text-3xl">
                  {props.stepAt !== UploadStep.Done &&
                    props.stepAt !== UploadStep.Error && (
                      <Loader2 size={28} className="animate-spin" />
                    )}
                  {props.stepAt === UploadStep.Done && (
                    <CheckCircle size={28} />
                  )}
                  {props.stepAt === UploadStep.Error && (
                    <AlertCircle size={28} />
                  )}
                </span>
              </AnimateOnChange>
            </div>

            <div>
              <h3
                className={cn(
                  'text-lg font-semibold',
                  props.stepAt === UploadStep.Done &&
                    'text-green-500 dark:text-green-400',
                  props.stepAt === UploadStep.Error &&
                    'text-red-500 dark:text-red-400',
                  props.stepAt !== UploadStep.Done &&
                    props.stepAt !== UploadStep.Error &&
                    'text-blue-500 dark:text-blue-400'
                )}
              >
                {t(`app.upload.progress.${props.stepAt}`)}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {progress}% complete
              </div>
            </div>
          </div>

          <div className="mb-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>
              {props.at} of {props.count}
            </span>
            <span>{progress}%</span>
          </div>
        </div>

        {props.message && (
          <div
            className={`w-full rounded-lg p-3 text-sm ${props.stepAt === UploadStep.Error ? 'border border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400' : 'border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400'} `}
          >
            {props.message}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default LoadingModal
