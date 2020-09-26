import { useQuery } from '@apollo/client'
import React, { useState } from 'react'
import QRCode from 'qrcode.react'
import Dialog from '../../components/dialog/dialog'
import wechatBindKeyQuery from '../../schema/bind.graphql'
import { wechatBind } from '../../schema/__generated__/wechatBind'

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
      value={data?.wechatBindKey}
      size={256}
    />
  )
}

function WechatBindButton(props: WechatBindButtonProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <button
        className='bg-blue-300 py-2 px-4 rounded text-lg'
        onClick={() => setVisible(true)}
      >
        微信小程序绑定
       </button>
      {visible && (
        <Dialog
          title='绑定'
          onCancel={() => { setVisible(false) }}
          onOk={() => { setVisible(true) }}
        >
          <div className='p-8 flex flex-col justify-center items-center'>
            <h2 className='text-2xl text-white mb-4'>使用 clippingKK 小程序 个人中心扫码即可绑定</h2>
            <BindQRCode />
          </div>
        </Dialog>
      )}
    </div>
  )
}

export default WechatBindButton
