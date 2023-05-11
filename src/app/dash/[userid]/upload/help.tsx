import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '../../../../components/dialog/dialog'

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

function ClippingsUploadHelp() {
  const [visible, setVisible] = useState(false)
  const { t } = useTranslation()
  return (
    <div className='w-full flex items-center justify-center my-8'>
      <button
        className='text-center text-gray-900 lg:text-lg hover:text-red-300 dark:text-gray-300'
        onClick={() => { setVisible(true) }}
      >
        {t('app.upload.help.title')}
      </button>

      {visible && (
        <Dialog
          onCancel={() => { setVisible(false) }}
          onOk={() => { setVisible(false) }}
          title='c'
        >
          <div
           className='p-4 lg:text-xl dark:text-gray-300'
           dangerouslySetInnerHTML={{ __html: t('app.upload.help.content') ?? ''}}
          >
            {/* {t('app.upload.help.content')} */}
          </div>
        </Dialog>
      )}
    </div>
  )

}


export default BilibiliUploadHelpVideo
