'use client'
import Modal from '@annatarhe/lake-ui/modal'
import { MessageCircle } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { type ProfileQuery, WechatBindDocument, type WechatBindQuery } from '@/gql/graphql'
import { useTranslation } from '@/i18n/client'

function BindQRCode() {
  const { data } = useQuery<WechatBindQuery>(WechatBindDocument)
  if (!data) {
    return null
  }

  return (
    <div className='rounded-xl bg-white p-2 shadow-md'>
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
        className='flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500/90 to-emerald-600/90 px-4 py-2.5 text-white shadow-md transition-all duration-300 hover:from-green-600/90 hover:to-emerald-700/90 hover:shadow-lg'
        onClick={() => setVisible(true)}
      >
        <MessageCircle className='h-5 w-5' />
        <span>{t('app.profile.wechatBind')}</span>
      </button>
      <Modal
        title={t('app.profile.wechatBind')}
        onClose={() => {
          setVisible(false)
        }}
        isOpen={visible}
      >
        <div className='flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-white/90 to-gray-100/90 p-8 backdrop-blur-md dark:from-gray-800/90 dark:to-gray-900/90'>
          <h2 className='mb-6 text-xl font-medium text-gray-800 dark:text-gray-200'>
            {t('app.profile.wechatBindTip')}
          </h2>
          <BindQRCode />
          <p className='mt-4 text-sm text-gray-500 dark:text-gray-400'>
            {t('app.profile.scanToConnect')}
          </p>
        </div>
      </Modal>
    </div>
  )
}

export default WechatBindButton
