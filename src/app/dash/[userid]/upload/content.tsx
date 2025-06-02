'use client'
import { useUploadData } from '@/hooks/my-file'
import { useActionTrack, usePageTrack } from '@/hooks/tracke'
import { useTranslation } from '@/i18n/client'
import { UploadStep } from '@/services/uploader'
import { FileText, Lock, Unlock, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import LoadingModal from './loading-modal'

function useSwitcher() {
  const [isOn, setIsOn] = useState(true)
  const onSwitchChange = useCallback((checked: boolean) => {
    setIsOn(checked)
  }, [])

  return {
    isOn,
    onSwitchChange,
  }
}

type Props = {
  profile: { id: number; domain: string }
}

function UploaderPageContent({ profile }: Props) {
  usePageTrack('uploader')

  const { isOn, onSwitchChange } = useSwitcher()
  const { onUpload, step, count, at, messages } = useUploadData(isOn, true)
  const onUploadTrack = useActionTrack('upload')
  const { t } = useTranslation(undefined, 'upload')
  const [isDragging, setIsDragging] = useState(false)

  const onDropEnd = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      onUploadTrack()
      onUpload(e, isOn)
      setIsDragging(false)
    },
    [onUpload, onUploadTrack, isOn]
  )

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
    <>
      <div
        className={`relative mb-8 flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed px-6 py-16 transition-all duration-300 md:py-24 ${
          isDragging
            ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/20'
            : 'border-gray-300 bg-white/50 hover:border-blue-500 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-blue-500'
        } shadow-lg backdrop-blur-sm`}
        onDragOver={stopDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDropEnd}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 ${isDragging ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        ></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-6 animate-pulse text-blue-500 dark:text-blue-400">
            <Upload size={64} strokeWidth={1.5} />
          </div>

          <h3 className="mb-2 text-center text-xl font-semibold md:text-2xl dark:text-slate-300">
            {isDragging
              ? (t('app.upload.drop.now') ?? 'Release to Upload')
              : (t('app.upload.drag.here') ?? 'Drag Your Clippings File Here')}
          </h3>

          <p className="max-w-md text-center text-sm text-gray-500 md:text-base dark:text-gray-400">
            {t('app.upload.file.hint') ??
              'Your file will be processed automatically when dropped here'}
          </p>

          <div className="mt-8 flex items-center text-sm text-gray-600 dark:text-gray-400">
            <FileText size={16} className="mr-2" />
            <span>
              {t('app.upload.file.supported') ??
                'Supported format: "My Clippings.txt"'}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-8 w-full rounded-xl bg-white/70 p-6 shadow-lg backdrop-blur-sm dark:bg-gray-800/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isOn ? (
              <Lock size={20} className="mr-2 text-green-500" />
            ) : (
              <Unlock size={20} className="mr-2 text-amber-500" />
            )}
            <span className="font-medium dark:text-slate-300">
              {t(`app.upload.private.${isOn ? 'on' : 'off'}.title`) ??
                (isOn ? 'Private Mode' : 'Public Mode')}
            </span>
          </div>

          <button
            onClick={() => onSwitchChange(!isOn)}
            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${isOn ? 'bg-green-500' : 'bg-gray-400'} `}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'} `}
            />
          </button>
        </div>

        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {isOn
            ? (t('app.upload.private.on.description') ??
              'Your clippings will be visible only to you')
            : (t('app.upload.private.off.description') ??
              'Your clippings will be shared with the community')}
        </p>
      </div>

      <LoadingModal
        visible={step === UploadStep.None}
        stepAt={step as UploadStep}
        count={count}
        at={at}
        message={messages[0]}
      />
    </>
  )
}

export default UploaderPageContent
