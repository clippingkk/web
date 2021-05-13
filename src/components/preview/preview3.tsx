import React, { useCallback, useEffect, useState } from 'react'
import { fetchClipping_clipping } from '../../schema/__generated__/fetchClipping'
import Dialog from '../dialog/dialog'
import { WenquBook } from '../../services/wenqu'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { getUTPLink, UTPService } from '../../services/utp'

const styles = require('./preview.css').default

type PreviewProps = {
  onCancel: () => void
  onOk: () => void
  background: string
  clipping: fetchClipping_clipping
  book: WenquBook | null
}

function Preview(props: PreviewProps) {
  const [shareURL, setShareURL] = useState('')
  const [loading, setLoading] = useState(true)
  const [errMsg, setErrMsg] = useState('')

  const onImageLoad = useCallback((e) => {
    setLoading(false)
  }, [])
  const onImageError = useCallback((e) => {
    toast.error(e.toString())
    setLoading(false)
    setErrMsg('')
  }, [])

  useEffect(() => {
    if (!props.book) {
      return
    }
    const data = {
      // id: props.clipping.id,
      // avatar: props.clipping.creator.avatar,
      // un: props.clipping.creator.name,
      // time: (new Date(props.clipping.createdAt)).getTime(),
      // content: props.clipping.content,
      // bt: props.book.title,
      // author: props.book.author,
      cid: props.clipping.id,
      bid: props.book.id,
      uid: props.clipping.creator.id,
    }

    setShareURL(getUTPLink(UTPService.clipping, data))
    setLoading(true)
    setErrMsg('')
  }, [props.clipping.id, props.book?.id])

  const { t } = useTranslation()
  return (
    <Dialog
      onCancel={props.onCancel}
      onOk={props.onOk}
      title={t('app.clipping.preview')}
    >
      <section className='flex'>
        <div className='w-full'>
          <img
            src={shareURL}
            onLoad={onImageLoad}
            onError={onImageError}
            className={styles['preview-image'] + ' transition-all duration-300' + loading ? 'hidden' : 'block'}
            alt={t('app.common.loading')}
          />
          {loading && (
            <span>{t('app.common.loading')}</span>
          )}
        </div>

        <footer className='text-white ml-4 border-white border-l'>
          <a
            href={shareURL}
            download={`clippingkk-${props.book?.title ?? ''}-${props.book?.author ?? ''}-${props.clipping.id}.png`}
            className='ml-4 text-white text-lg'
            target='_blank'
          >
            {t('app.clipping.save')}
          </a>
        </footer>
      </section>
    </Dialog>
  )
}

export default Preview
