import { getLocalToken } from '@/services/ajax'
import { QRCodeCanvas } from 'qrcode.react'
import logo from '../../assets/logo.png'

function LoginByQRCode() {
  const theToken = getLocalToken()
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center justify-center">
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
        <div className="mt-4 text-center">
          <span>
            Please scan the QRCode above by `ClippingKK` on your phone
          </span>
          <span>
            If you havn`t download yet, you can try to search in AppStore
          </span>
        </div>
      </div>
    </div>
  )
}

export default LoginByQRCode
