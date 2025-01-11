import React, { useState } from 'react'
// import { QRNormal, QRImage } from 'react-qrbtf'
import { QRCodeSVG } from 'qrcode.react'
import Dialog from '@/components/dialog/dialog'
import { useTranslation } from 'react-i18next'
import { useWechatBindQuery } from '@/schema/generated'

function BindQRCode() {
  const { data } = useWechatBindQuery()
  if (!data) {
    return null
  }

  return (
    <QRCodeSVG
      // className='animate__fadeInDown'
      value={data.wechatBindKey}
      size={256}
    />
  )
}

function WechatBindButton() {
  const [visible, setVisible] = useState(false)
  const { t } = useTranslation()

  return (
    <div>
      <button
        className='bg-blue-400 text-gray-200 py-2 px-4 rounded text-lg mb-4 hover:bg-blue-600'
        onClick={() => setVisible(true)}
      >
        {t('app.profile.wechatBind')}
      </button>
      {visible && (
        <Dialog
          title={t('app.profile.wechatBind')}
          onCancel={() => { setVisible(false) }}
          onOk={() => { setVisible(true) }}
        >
          <div className='p-8 flex flex-col justify-center items-center'>
            <h2 className='text-2xl text-black mb-4'>{t('app.profile.wechatBindTip')}</h2>
            <BindQRCode />
          </div>
        </Dialog>
      )}
    </div>
  )
}

export default WechatBindButton
