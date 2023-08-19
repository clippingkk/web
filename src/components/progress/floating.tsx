import React from 'react'
import { UploadStep } from '../../services/uploader'
import { useTranslation } from 'react-i18next'
import Loading2Icon from '../icons/loading2.svg'

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
    <div className='fixed bottom-10 right-10 rounded bg-gradient-to-br from-purple-400 to-teal-400 px-4 py-2 flex justify-center items-center shadow animate-bounce'>
      <div className='flex justify-center items-center flex-row'>
        <Loading2Icon />
        <div className='flex'>
          <span className='text-right'>
            {t(`app.upload.progress.${step}`)}
          </span>
          <span className='ml-2'>{at}/{count}</span>
        </div>
      </div>
    </div>
  )
}

export default FloatingProgress
