import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { saveAs } from 'file-saver'
import { fetchClipping_clipping, fetchClipping_clipping_creator } from '../../schema/__generated__/fetchClipping'
import { WenquBook } from '../../services/wenqu'
import Dialog from '../dialog/dialog'
import domtoimage from 'dom-to-image'
import { FetchQRCode } from '../../services/mp'
import { useLocalTime } from '../../hooks/time'
const styles = require('./preview.css').default

type PreviewProps = {
  onCancel: () => void
  onOk: () => void
  background: string
  clipping: fetchClipping_clipping
  book: WenquBook | null
}

const QRCODE_SIZE = 90

function useQRCode(clippingID: number) {
  const [qrcodeSrc, setQRCodeSrc] = useState('')
  useEffect(() => {
    if (!clippingID) {
      return
    }

    FetchQRCode(`c=${clippingID}`, 'pages/landing/landing', QRCODE_SIZE, true).then(imageElement => {
      setQRCodeSrc(imageElement.src)
    })
  }, [clippingID])

  return qrcodeSrc
}

function Preview(props: PreviewProps) {
  const qrcodeSrc = useQRCode(props.clipping.id)
  const { t } = useTranslation()

  const clippingAt = useLocalTime(props.clipping.createdAt)

  const shareImageDOM = useRef<HTMLDivElement | null>(null)

  const onSave = useCallback(() => {
    if (!shareImageDOM.current) {
      return
    }

    domtoimage.toBlob(shareImageDOM.current)
      .then(function (blob) {
        saveAs(blob, `${props.clipping.creator.id}-${props.book?.title}-${props.clipping.id}.png`)
      })
  }, [])

  return (
    <Dialog
      onCancel={props.onCancel}
      onOk={props.onOk}
      title={t('app.clipping.preview')}
    >
      <div>
        <section
          className={' bg-cover bg-no-repeat bg-center bg-gray-100 bg-opacity-90'}
          style={{
            backgroundImage: `url(${props.background})`
          }}
          ref={shareImageDOM}
        >
          <div className={'w-full h-full bg-gray-100 bg-opacity-80 px-8 py-16 flex flex-col justify-between items-center ' + styles['preview-image']}>
            <div>

              <p className='text-2xl leading-10 font-black'>{props.clipping.content}</p>

              <div className='mt-10 text-right'>
                <h3>{props.book?.title ?? props.clipping.title}</h3>
                <h5 className='text-sm'>{props.book?.author ?? ''}</h5>
              </div>
            </div>
            <div className='border-t-2 pt-10 flex justify-between items-center w-full'>
              <div>
                <img src={props.clipping.creator.avatar} className='w-16 h-16 rounded-full' />
                <h3 className='text-gray-700'>{props.clipping.creator.name}</h3>
                <time className='text-gray-500'>{t('app.clipping.at')}: {clippingAt}</time>
              </div>
              <div>
                <img src={qrcodeSrc} className='w-32 h-32' alt="qrcode" />
              </div>
            </div>
          </div>
        </section>
        <hr />
        <div className='mt-4'>
          <button
            onClick={onSave}
            className='bg-blue-400 px-8 py-4 rounded'
          >
            save
          </button>
        </div>
      </div>
    </Dialog>
  )
}

export default Preview
