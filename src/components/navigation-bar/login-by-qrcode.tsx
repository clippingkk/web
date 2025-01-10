import { Container } from '@mantine/core'
import logo from '../../assets/logo.png'
import { QRCodeCanvas } from 'qrcode.react'
import React from 'react'
import { useSelector } from 'react-redux'
import { TGlobalStore } from '../../store/index'

function LoginByQRCode() {
  const theToken = useSelector<TGlobalStore, string>(app => app.user.token)
  return (
    <Container>
      <div className=' flex flex-col justify-center items-center'>
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
        <div className=' mt-4 text-center'>
          <span>Please scan the QRCode above by `ClippingKK` on your phone</span>
          <span>If you havn`t download yet, you can try to search in AppStore</span>
        </div>
      </div>
    </Container>
  )
}

export default LoginByQRCode
