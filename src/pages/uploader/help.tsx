import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '../../components/dialog/dialog'

function ClippingsUploadHelp() {
  const [visible, setVisible] = useState(false)
  const { t } = useTranslation()
  return (
    <div className='w-full flex items-center justify-center my-8'>
      <button
        className='text-center text-gray-900 text-lg hover:text-red-300 dark:text-gray-300'
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
           className='p-4 text-xl dark:text-gray-300'
           dangerouslySetInnerHTML={{ __html: t('app.upload.help.content')}}
          >
            {/* {t('app.upload.help.content')} */}
          </div>
        </Dialog>
      )}
    </div>
  )

}


export default ClippingsUploadHelp
