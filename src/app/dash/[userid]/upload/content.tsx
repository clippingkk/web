'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { usePageTrack, useActionTrack } from '../../../../hooks/tracke'
import { useTranslation } from '@/i18n/client'
import { UploadStep } from '@/services/uploader'
import LoadingModal from './loading-modal'
import ClippingsUploadHelp from './help'
import { useUploadData } from '@/hooks/my-file'
import { useRouter } from 'next/navigation'
import AnimateOnChange from '@/components/SimpleAnimation/AnimateOnChange'
import { Upload, Lock, Unlock, FileText } from 'lucide-react'

function useSwitcher() {
  const [isOn, setIsOn] = useState(true)
  const onSwitchChange = useCallback((checked: boolean) => {
    setIsOn(checked)
  }, [])

  return {
    isOn,
    onSwitchChange
  }
}

type Props = {
  profile: { id: number, domain: string }
}

function UploaderPageContent({ profile }: Props) {
  usePageTrack('uploader')

  const { isOn, onSwitchChange } = useSwitcher()
  const { onUpload, step, count, at, messages } = useUploadData(isOn, true)
  const onUploadTrack = useActionTrack('upload')
  const { t } = useTranslation(undefined, 'upload')
  const [isDragging, setIsDragging] = useState(false)

  const onDropEnd = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    onUploadTrack()
    onUpload(e, isOn)
    setIsDragging(false)
  }, [onUpload, onUploadTrack, isOn])

  const stopDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const { push: navigate } = useRouter()

  const domain = profile.domain.length > 2 ? profile.domain : profile.id

  useEffect(() => {
    if (step === UploadStep.Done) {
      setTimeout(() => {
        navigate(`/dash/${domain}/home`)
      }, 3000)
    }
  }, [step, domain, navigate])

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
            {t('app.upload.tip')}
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            {t('app.upload.private.description') ?? 'Drag and drop your Kindle clippings file to share your favorite passages'}
          </p>
        </div>

        <div
          className={`
            w-full rounded-xl border-2 border-dashed transition-all duration-300 
            flex flex-col items-center justify-center py-16 px-6 md:py-24 mb-8 
            cursor-pointer relative overflow-hidden
            ${isDragging
      ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/20'
      : 'border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white/50 dark:bg-gray-800/50'}
            backdrop-blur-sm shadow-lg
          `}
          onDragOver={stopDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDropEnd}
        >
          <div className={`
            absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 
            ${isDragging ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300
          `}></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="text-blue-500 dark:text-blue-400 mb-6 animate-pulse">
              <Upload size={64} strokeWidth={1.5} />
            </div>

            <h3 className="text-xl md:text-2xl font-semibold mb-2 text-center">
              {isDragging
                ? t('app.upload.drop.now') ?? 'Release to Upload'
                : t('app.upload.drag.here') ?? 'Drag Your Clippings File Here'}
            </h3>

            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 text-center max-w-md">
              {t('app.upload.file.hint') ?? 'Your file will be processed automatically when dropped here'}
            </p>

            <div className="flex items-center mt-8 text-sm text-gray-600 dark:text-gray-400">
              <FileText size={16} className="mr-2" />
              <span>{t('app.upload.file.supported') ?? 'Supported format: "My Clippings.txt"'}</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl shadow-lg mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isOn ? (
                <Lock size={20} className="text-green-500 mr-2" />
              ) : (
                <Unlock size={20} className="text-amber-500 mr-2" />
              )}
              <span className="font-medium dark:text-gray-300">
                <AnimateOnChange>
                  <>
                    {t(`app.upload.private.${isOn ? 'on' : 'off'}`) ?? (isOn ? 'Private Mode' : 'Public Mode')}
                  </>
                </AnimateOnChange>
              </span>
            </div>

            <button
              onClick={() => onSwitchChange(!isOn)}
              className={`
                relative inline-flex h-6 w-12 items-center rounded-full transition-colors
                ${isOn ? 'bg-green-500' : 'bg-gray-400'}
              `}
            >
              <span
                className={`
                  inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform
                  ${isOn ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {isOn
              ? t('app.upload.private.on.description') ?? 'Your clippings will be visible only to you'
              : t('app.upload.private.off.description') ?? 'Your clippings will be shared with the community'}
          </p>
        </div>

        <ClippingsUploadHelp />
      </div>

      {step !== UploadStep.None && (
        <LoadingModal
          stepAt={step as UploadStep}
          count={count}
          at={at}
          message={messages[0]}
        />
      )}
    </section>
  )
}

export default UploaderPageContent
