import { useQuery } from '@apollo/client'
import React, { useState } from 'react'
// import { QRNormal, QRImage } from 'react-qrbtf'
import QRCode from 'qrcode.react'
import Dialog from '../../components/dialog/dialog'
import wechatBindKeyQuery from '../../schema/bind.graphql'
import { wechatBind } from '../../schema/__generated__/wechatBind'
import { useTranslation } from 'react-i18next'

type WechatBindButtonProps = {
}

function BindQRCode() {
  const { data } = useQuery<wechatBind, null>(wechatBindKeyQuery)
  if (!data) {
    return null
  }

  return (
    <QRCode
      className='animate__fadeInDown'
      value={data.wechatBindKey}
      size={256}
    />
  )
}

function WechatBindButton(props: WechatBindButtonProps) {
  const [visible, setVisible] = useState(false)
  const { t } = useTranslation()

  return (
    <div>
      <button
        className='bg-blue-300 py-2 px-4 rounded text-lg'
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
