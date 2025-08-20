import { QRCodeCanvas } from 'qrcode.react'
import { useTranslation } from '@/i18n/client'
import { getLocalToken } from '@/services/ajax'
import logo from '../../assets/logo.png'

function LoginByQRCode() {
  const theToken = getLocalToken()
  const { t } = useTranslation(undefined, 'navigation')
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center justify-center p-8">
        <QRCodeCanvas
          value={theToken}
          size={250}
          imageSettings={{
            src: logo.src,
            height: 50,
            width: 50,
            excavate: true,
          }}
        />
        <div className="mt-4 flex flex-col gap-1 text-center">
          <span className="text-sm dark:text-white">
            {t('app.loginByQRCode.scanInstruction')}
          </span>
          <span className="text-sm dark:text-white">
            {t('app.loginByQRCode.downloadInstruction')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default LoginByQRCode
