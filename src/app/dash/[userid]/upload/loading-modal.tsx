import React, { useMemo } from 'react'
import { UploadStep } from '../../../../services/uploader'
import { useTranslation } from '@/i18n/client'
import AnimateOnChange from '../../../../components/SimpleAnimation/AnimateOnChange'
import { CheckCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'

type LoadingModalProps = {
  stepAt: UploadStep
  count: number
  at: number
  message?: string
}

function LoadingModal(props: LoadingModalProps) {
  const { t } = useTranslation()
  const progress = useMemo(() => {
    return Math.min(100, Math.round((props.at / props.count) * 100)) || 0
  }, [props.at, props.count])

  const getStepIcon = (step: UploadStep) => {
    switch (step) {
      case UploadStep.Done:
        return <CheckCircle className="text-green-500" size={28} />
      case UploadStep.Error:
        return <AlertCircle className="text-red-500" size={28} />
      default:
        return <div className="w-7 h-7 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
    }
  }

  const isCurrentStep = (step: UploadStep) => props.stepAt === step
  const isPastStep = (step: UploadStep) => {
    return Object.values(UploadStep).indexOf(props.stepAt) > Object.values(UploadStep).indexOf(step)
  }

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 bg-black/40 backdrop-blur-md anna-fade-in"
    >
      <div
        className="w-full max-w-xl px-6 py-8 rounded-xl shadow-2xl 
                 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800
                 flex flex-col items-center mx-4"
      >
        <div className="w-full mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            {t('app.upload.tips.extracting')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {t('app.upload.tips.wait') ?? 'Please wait while we process your clippings'}
          </p>
        </div>
        
        <div className="w-full mb-8 px-4">
          <div className="relative">
            <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>
            <div 
              className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 z-10 transition-all duration-500 ease-in-out"
              style={{ width: `${props.stepAt === UploadStep.Done ? 100 : progress}%` }}
            ></div>
            
            <div className="relative z-20 flex justify-between">
              {Object.values(UploadStep).filter(step => typeof step === 'number').map((step, index) => {
                const stepKey = `app.upload.progress.${step}`;
                const stepLabel = t(stepKey, { defaultValue: `Step ${index + 1}` });
                const shortLabel = stepLabel.split(' ')[0];
                
                return (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full 
                      ${isCurrentStep(step as UploadStep) ? 'bg-blue-500 dark:bg-blue-600 text-white' : ''}
                      ${isPastStep(step as UploadStep) ? 'bg-green-100 dark:bg-green-900 text-green-500' : ''}
                      ${!isCurrentStep(step as UploadStep) && !isPastStep(step as UploadStep) ? 'bg-gray-100 dark:bg-gray-800' : ''}
                      transition-all duration-300
                    `}>
                      {isCurrentStep(step as UploadStep) && (
                        <Loader2 size={18} className="animate-spin" />
                      )}
                      {isPastStep(step as UploadStep) && (
                        <CheckCircle size={18} />
                      )}
                      {!isCurrentStep(step as UploadStep) && !isPastStep(step as UploadStep) && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{index + 1}</span>
                      )}
                    </div>
                    <span className={`
                      text-xs mt-2 text-center
                      ${isCurrentStep(step as UploadStep) ? 'text-blue-500 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400'}
                      ${isPastStep(step as UploadStep) ? 'text-green-500 dark:text-green-400' : ''}
                    `}>
                      {shortLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 
                        ${props.stepAt === UploadStep.Done ? 'bg-green-100 dark:bg-green-900/30 text-green-500' : ''}
                        ${props.stepAt === UploadStep.Error ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : ''}
                        ${props.stepAt !== UploadStep.Done && props.stepAt !== UploadStep.Error ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' : ''}
                      `}>
              <AnimateOnChange>
                <span className="text-3xl">
                  {props.stepAt !== UploadStep.Done && props.stepAt !== UploadStep.Error && (
                    <Loader2 size={28} className="animate-spin" />
                  )}
                  {props.stepAt === UploadStep.Done && <CheckCircle size={28} />}
                  {props.stepAt === UploadStep.Error && <AlertCircle size={28} />}
                </span>
              </AnimateOnChange>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">
                {t(`app.upload.progress.${props.stepAt}`)}
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {progress}% complete
              </div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{props.at} of {props.count}</span>
            <span>{progress}%</span>
          </div>
        </div>
        
        {props.message && (
          <div className={`
            w-full p-3 rounded-lg text-sm 
            ${props.stepAt === UploadStep.Error ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50'}
          `}>
            {props.message}
          </div>
        )}
      </div>
    </div>
  )
}

export default LoadingModal
