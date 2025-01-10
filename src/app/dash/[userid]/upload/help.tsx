import React from 'react'
import { useTranslation } from 'react-i18next'

function BilibiliUploadHelpVideo() {
  const { t } = useTranslation()
  return (
    <div className='w-full flex items-center justify-center my-8'>
      <a
        className='text-center text-gray-900 lg:text-lg hover:text-red-300 dark:text-gray-300'
        href='https://www.bilibili.com/video/BV11z4y1y7fx'
        target='_blank' rel="noreferrer"
      >
        {t('app.upload.help.title')}
      </a>
    </div>
  )
}

export default BilibiliUploadHelpVideo
