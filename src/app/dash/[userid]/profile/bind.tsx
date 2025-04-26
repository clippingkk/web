'use client'
import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import Modal from '@annatarhe/lake-ui/modal'
import { useTranslation } from 'react-i18next'
import { ProfileQuery, useWechatBindQuery } from '@/schema/generated'
import { MessageCircle } from 'lucide-react'

function BindQRCode() {
  const { data } = useWechatBindQuery()
  if (!data) {
    return null
  }

  return (
    <div className="p-2 rounded-xl bg-white shadow-md">
      <QRCodeSVG
        value={data.wechatBindKey}
        size={256}
        bgColor={'#FFFFFF'}
        fgColor={'#000000'}
        level={'H'}
        includeMargin={false}
      />
    </div>
  )
}

type Props = {
  uid?: number
  profile: ProfileQuery['me']
  isInMyPage: boolean
}

function WechatBindButton(props: Props) {
  const [visible, setVisible] = useState(false)
  const { t } = useTranslation()

  const { uid, profile, isInMyPage } = props

  let isWechatBindingVisible = true

  if (!uid || uid === 0) {
    isWechatBindingVisible = false
  }
  if (!isInMyPage) {
    isWechatBindingVisible = false
  }
  isWechatBindingVisible = !!profile.wechatOpenid

  if (!isWechatBindingVisible) {
    return null
  }

  return (
    <div>
      <button
        className='flex items-center gap-2 py-2.5 px-4 rounded-xl transition-all duration-300 bg-gradient-to-r from-green-500/90 to-emerald-600/90 hover:from-green-600/90 hover:to-emerald-700/90 text-white shadow-md hover:shadow-lg'
        onClick={() => setVisible(true)}
      >
        <MessageCircle className="w-5 h-5" />
        <span>{t('app.profile.wechatBind')}</span>
      </button>
      <Modal
        title={t('app.profile.wechatBind')}
        onClose={() => { setVisible(false) }}
        isOpen={visible}
      >
        <div className='p-8 flex flex-col justify-center items-center bg-gradient-to-br from-white/90 to-gray-100/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-md rounded-xl'>
          <h2 className='text-xl font-medium text-gray-800 dark:text-gray-200 mb-6'>{t('app.profile.wechatBindTip')}</h2>
          <BindQRCode />
          <p className='mt-4 text-sm text-gray-500 dark:text-gray-400'>{t('app.profile.scanToConnect')}</p>
        </div>
      </Modal>
    </div>
  )
}

export default WechatBindButton
